import { performance } from "node:perf_hooks";
import type { LoadTestArgs, LoadTestClient, LoadTestContext, ModePreset, ScenarioName } from "./types.ts";
import { modePresets, scenarioCatalog, suites } from "./config.ts";

function percentile(sortedValues: number[], percentileValue: number) {
	if (sortedValues.length === 0) {
		return 0;
	}

	const index = Math.min(
		sortedValues.length - 1,
		Math.max(0, Math.ceil((percentileValue / 100) * sortedValues.length) - 1),
	);
	return sortedValues[index] ?? 0;
}

function formatNumber(value: number) {
	return new Intl.NumberFormat("en-US", {
		maximumFractionDigits: 2,
	}).format(value);
}

export function formatError(error: unknown) {
	if (error instanceof Error) {
		return error.name === "TRPCClientError"
			? error.message
			: `${error.name}: ${error.message}`;
	}

	return typeof error === "string" ? error : "Unknown error";
}

export function formatSummary(value: number) {
	return formatNumber(value);
}

export function resolveSuiteScenarioNames({
	suite,
	scenario,
}: Pick<LoadTestArgs, "suite" | "scenario">): ScenarioName[] {
	if (scenario) {
		if (!(scenario in scenarioCatalog)) {
			throw new Error(
				`Unknown scenario "${scenario}". Available: ${Object.keys(scenarioCatalog).join(", ")}`,
			);
		}

		return [scenario as ScenarioName];
	}

	const suiteNames = suites[suite];
	if (!suiteNames) {
		throw new Error(
			`Unknown suite "${suite}". Available: ${Object.keys(suites).join(", ")}`,
		);
	}

	return suiteNames;
}

export function normalizePreset(args: LoadTestArgs, modeName: keyof typeof modePresets) {
	const preset = modePresets[modeName];

	return {
		...preset,
		users:
			Number.isFinite(args.users) && args.users !== null ? args.users : preset.users,
		durationSec:
			Number.isFinite(args.durationSec) && args.durationSec !== null
				? args.durationSec
				: preset.durationSec,
	};
}

export async function seedContext(
	client: LoadTestClient,
	scenarioNames: ScenarioName[],
	explicitScriptId: string,
	explicitSessionId: string,
	cookiePresent: boolean,
) {
	const context: LoadTestContext = {
		scriptId: explicitScriptId,
		sessionId: explicitSessionId,
		cookiePresent,
	};

	if (!cookiePresent) {
		return context;
	}

	if (
		!context.scriptId &&
		scenarioNames.some((name) => scenarioCatalog[name].needs.includes("scriptId"))
	) {
		const latestScripts = await client.script.getLatest.query({ limit: 1 });
		context.scriptId = latestScripts[0]?.id ?? "";
	}

	if (
		!context.sessionId &&
		scenarioNames.some((name) => scenarioCatalog[name].needs.includes("sessionId"))
	) {
		if (!context.scriptId) {
			const latestScripts = await client.script.getLatest.query({ limit: 1 });
			context.scriptId = latestScripts[0]?.id ?? "";
		}

		if (context.scriptId) {
			context.sessionId = await client.session.createNewSession.mutate(
				context.scriptId,
			);
		}
	}

	return context;
}

export async function runScenario({
	client,
	scenarioName,
	modeName,
	preset,
	context,
}: {
	client: LoadTestClient;
	scenarioName: ScenarioName;
	modeName: keyof typeof modePresets;
	preset: ModePreset;
	context: LoadTestContext;
}) {
	const scenario = scenarioCatalog[scenarioName];

	if (scenario.requiresAuth && !context.cookiePresent) {
		return {
			skipped: true,
			reason: "missing auth cookie",
		} as const;
	}

	for (const requirement of scenario.needs) {
		if (!context[requirement]) {
			return {
				skipped: true,
				reason: `missing ${requirement}`,
			} as const;
		}
	}

	const deadline = performance.now() + preset.durationSec * 1000;
	const rampMs = Math.min(5000, preset.durationSec * 200);
	const latencySamples: number[] = [];
	const errors = new Map<string, number>();
	let completed = 0;
	let failed = 0;

	const workers = Array.from({ length: preset.users }, async (_, workerIndex) => {
		if (rampMs > 0) {
			const delayMs = Math.round((workerIndex / preset.users) * rampMs);
			if (delayMs > 0) {
				await new Promise((resolve) => setTimeout(resolve, delayMs));
			}
		}

		while (performance.now() < deadline) {
			const startedAt = performance.now();
			try {
				await scenario.run(client, context);
				latencySamples.push(performance.now() - startedAt);
				completed++;
			} catch (error) {
				latencySamples.push(performance.now() - startedAt);
				failed++;
				const key = formatError(error);
				errors.set(key, (errors.get(key) ?? 0) + 1);
			}
		}
	});

	await Promise.all(workers);

	latencySamples.sort((left, right) => left - right);
	const total = completed + failed;

	return {
		skipped: false as const,
		scenario: scenario.title,
		mode: modeName,
		users: preset.users,
		durationSec: preset.durationSec,
		total,
		completed,
		failed,
		rps: total / preset.durationSec,
		p50: percentile(latencySamples, 50),
		p95: percentile(latencySamples, 95),
		p99: percentile(latencySamples, 99),
		errors: Array.from(errors.entries()).sort((left, right) => right[1] - left[1]),
	};
}
