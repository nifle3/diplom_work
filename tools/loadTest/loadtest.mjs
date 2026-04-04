#!/usr/bin/env node
import { performance } from "node:perf_hooks";
import process from "node:process";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";

const modePresets = {
	baseline: { users: 8, durationSec: 20 },
	working: { users: 30, durationSec: 30 },
	elevated: { users: 75, durationSec: 40 },
	stress: { users: 1500, durationSec: 45 },
};

const scenarioCatalog = {
	healthCheck: {
		label: "healthCheck",
		title: "Public health check",
		requiresAuth: false,
		needs: [],
		run: async (client) => client.healthCheck.query(),
	},
	scriptCategories: {
		label: "script.categories",
		title: "Script categories",
		requiresAuth: true,
		needs: [],
		run: async (client) => client.script.categories.query(),
	},
	scriptLatest: {
		label: "script.getLatest",
		title: "Latest scripts",
		requiresAuth: true,
		needs: [],
		run: async (client) => client.script.getLatest.query({ limit: 5 }),
	},
	scriptList: {
		label: "script.list",
		title: "Script list",
		requiresAuth: true,
		needs: [],
		run: async (client) => client.script.list.query({ page: 1, limit: 12 }),
	},
	scriptInfo: {
		label: "script.getInfo",
		title: "Script details",
		requiresAuth: true,
		needs: ["scriptId"],
		run: async (client, context) =>
			client.script.getInfo.query(context.scriptId),
	},
	userStats: {
		label: "user.getStats",
		title: "User stats",
		requiresAuth: true,
		needs: [],
		run: async (client) => client.user.getStats.query(),
	},
	userStreak: {
		label: "user.getStreak",
		title: "User streak",
		requiresAuth: true,
		needs: [],
		run: async (client) => client.user.getStreak.query(),
	},
	profileStats: {
		label: "profile.getMyProfileStats",
		title: "Profile stats",
		requiresAuth: true,
		needs: [],
		run: async (client) => client.profile.getMyProfileStats.query(),
	},
	profileHistory: {
		label: "profile.getMyHistory",
		title: "Profile history",
		requiresAuth: true,
		needs: [],
		run: async (client) => client.profile.getMyHistory.query(),
	},
	profileAchievements: {
		label: "profile.getMyAchivements",
		title: "Profile achievements",
		requiresAuth: true,
		needs: [],
		run: async (client) => client.profile.getMyAchivements.query(),
	},
	activityLatest: {
		label: "activity.getLatestUserActivity",
		title: "Latest activity",
		requiresAuth: true,
		needs: [],
		run: async (client) => client.activity.getLatestUserActivity.query(),
	},
	fileUploadLink: {
		label: "file.getUploadLink",
		title: "Avatar upload link",
		requiresAuth: true,
		needs: [],
		run: async (client) =>
			client.file.getUploadLink.mutate({
				filename: "avatar.png",
				contentType: "image/png",
				folder: "avatars",
			}),
	},
	sessionScript: {
		label: "session.getScriptByInterviewId",
		title: "Session script",
		requiresAuth: true,
		needs: ["sessionId"],
		run: async (client, context) =>
			client.session.getScriptByInterviewId.query(context.sessionId),
	},
	sessionHistory: {
		label: "session.getAllHistory",
		title: "Session history",
		requiresAuth: true,
		needs: ["sessionId"],
		run: async (client, context) =>
			client.session.getAllHistory.query(context.sessionId),
	},
};

const suites = {
	public: ["healthCheck"],
	catalog: ["scriptCategories", "scriptLatest", "scriptList", "scriptInfo"],
	user: [
		"userStats",
		"userStreak",
		"profileStats",
		"profileHistory",
		"profileAchievements",
		"activityLatest",
	],
	storage: ["fileUploadLink"],
	session: ["sessionScript", "sessionHistory"],
	core: [
		"healthCheck",
		"scriptCategories",
		"scriptLatest",
		"scriptList",
		"scriptInfo",
		"userStats",
		"userStreak",
		"profileStats",
		"profileHistory",
		"profileAchievements",
		"activityLatest",
		"fileUploadLink",
	],
	all: Object.keys(scenarioCatalog),
};

function parseArgs(argv) {
	const result = {
		baseUrl: process.env.LOADTEST_BASE_URL ?? "http://localhost:3001",
		cookie: process.env.LOADTEST_COOKIE ?? "",
		headersJson: process.env.LOADTEST_HEADERS_JSON ?? "",
		timeoutMs: Number(process.env.LOADTEST_TIMEOUT_MS ?? "30000"),
		suite: process.env.LOADTEST_SUITE ?? "core",
		scenario: process.env.LOADTEST_SCENARIO ?? "",
		mode: process.env.LOADTEST_MODE ?? "baseline",
		modes: "",
		users: null,
		durationSec: null,
		scriptId: process.env.LOADTEST_SCRIPT_ID ?? "",
		sessionId: process.env.LOADTEST_SESSION_ID ?? "",
	};

	for (let index = 0; index < argv.length; index++) {
		const token = argv[index];
		if (!token) {
			continue;
		}

		if (token === "--help" || token === "-h") {
			result.help = true;
			continue;
		}

		const [keyFromEquals, valueFromEquals] = token.startsWith("--")
			? token.slice(2).split(/=(.*)/s, 2)
			: [null, null];

		const key = keyFromEquals ?? token;
		const nextValue = argv[index + 1];
		const takeNextValue =
			typeof nextValue === "string" && !nextValue.startsWith("--");

		const readValue = () => {
			if (valueFromEquals !== null && valueFromEquals !== undefined) {
				return valueFromEquals;
			}

			if (takeNextValue) {
				index++;
				return nextValue;
			}

			return "true";
		};

		switch (key) {
			case "base-url":
				result.baseUrl = readValue();
				break;
			case "cookie":
				result.cookie = readValue();
				break;
			case "headers-json":
				result.headersJson = readValue();
				break;
			case "timeout-ms":
				result.timeoutMs = Number(readValue());
				break;
			case "suite":
				result.suite = readValue();
				break;
			case "scenario":
				result.scenario = readValue();
				break;
			case "mode":
				result.mode = readValue();
				break;
			case "modes":
				result.modes = readValue();
				break;
			case "users":
				result.users = Number(readValue());
				break;
			case "duration-sec":
				result.durationSec = Number(readValue());
				break;
			case "script-id":
				result.scriptId = readValue();
				break;
			case "session-id":
				result.sessionId = readValue();
				break;
			default:
				break;
		}
	}

	return result;
}

function printHelp() {
	console.log(`
Load test runner for tRPC handlers

Usage:
  node tools/loadTest/loadtest.mjs [options]

Options:
  --suite <name>       Scenario suite: public, catalog, user, storage, session, core, all
  --scenario <name>    Run one scenario from the catalog
  --mode <name>        One preset: baseline, working, elevated, stress
  --modes <list>       Comma-separated list of presets
  --users <number>     Override users for the selected mode
  --duration-sec <n>   Override duration for the selected mode
  --base-url <url>     API base URL, default http://localhost:3001
  --cookie <value>     Cookie header for authenticated routes
  --headers-json <j>   Extra headers as JSON object
  --timeout-ms <n>     Request timeout per call
  --script-id <uuid>   Optional script id for script.getInfo
  --session-id <uuid>  Optional session id for session suite

Examples:
  nix develop -c pnpm --dir tools/loadTest run load -- --suite core --mode baseline --cookie "$LOADTEST_COOKIE"
  nix develop -c node tools/loadTest/loadtest.mjs --scenario healthCheck --mode stress
`);
}

function normalizeBaseUrl(baseUrl) {
	return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

function percentile(sortedValues, percentileValue) {
	if (sortedValues.length === 0) {
		return 0;
	}

	const index = Math.min(
		sortedValues.length - 1,
		Math.max(0, Math.ceil((percentileValue / 100) * sortedValues.length) - 1),
	);
	return sortedValues[index] ?? 0;
}

function formatNumber(value) {
	return new Intl.NumberFormat("en-US", {
		maximumFractionDigits: 2,
	}).format(value);
}

function formatDuration(seconds) {
	if (seconds >= 60) {
		return `${formatNumber(seconds / 60)}m`;
	}

	return `${formatNumber(seconds)}s`;
}

function formatError(error) {
	if (error instanceof Error) {
		return error.name === "TRPCClientError"
			? error.message
			: `${error.name}: ${error.message}`;
	}

	return typeof error === "string" ? error : "Unknown error";
}

function buildClient({ baseUrl, cookie, headersJson, timeoutMs }) {
	let extraHeaders = {};
	if (headersJson.trim()) {
		try {
			extraHeaders = JSON.parse(headersJson);
		} catch (error) {
			throw new Error(`LOADTEST_HEADERS_JSON must be valid JSON: ${formatError(error)}`);
		}
	}

	if (extraHeaders === null || typeof extraHeaders !== "object" || Array.isArray(extraHeaders)) {
		throw new Error("LOADTEST_HEADERS_JSON must be an object");
	}

	const headers = {};
	if (cookie.trim()) {
		headers.cookie = cookie.trim();
	}
	Object.assign(headers, extraHeaders);

	return createTRPCProxyClient({
		links: [
			httpBatchLink({
				url: `${normalizeBaseUrl(baseUrl)}/api/trpc`,
				transformer: superjson,
				headers() {
					return headers;
				},
				fetch: (url, options) => {
					const requestTimeout = AbortSignal.timeout(timeoutMs);
					const signal = options?.signal
						? AbortSignal.any([options.signal, requestTimeout])
						: requestTimeout;

					return fetch(url, {
						...options,
						signal,
					});
				},
			}),
		],
	});
}

function resolveSuiteScenarioNames({ suite, scenario }) {
	if (scenario) {
		if (!scenarioCatalog[scenario]) {
			throw new Error(
				`Unknown scenario "${scenario}". Available: ${Object.keys(scenarioCatalog).join(", ")}`,
			);
		}

		return [scenario];
	}

	const suiteNames = suites[suite];
	if (!suiteNames) {
		throw new Error(
			`Unknown suite "${suite}". Available: ${Object.keys(suites).join(", ")}`,
		);
	}

	return suiteNames;
}

async function seedContext(
	client,
	scenarioNames,
	explicitScriptId,
	explicitSessionId,
	cookiePresent,
) {
	const context = {
		scriptId: explicitScriptId || "",
		sessionId: explicitSessionId || "",
	};

	if (!cookiePresent) {
		return context;
	}

	if (
		!context.scriptId &&
		scenarioNames.some((name) =>
			scenarioCatalog[name]?.needs.includes("scriptId"),
		)
	) {
		const latestScripts = await client.script.getLatest.query({ limit: 1 });
		context.scriptId = latestScripts[0]?.id ?? "";
	}

	if (
		!context.sessionId &&
		scenarioNames.some((name) =>
			scenarioCatalog[name]?.needs.includes("sessionId"),
		)
	) {
		if (!context.scriptId) {
			const latestScripts = await client.script.getLatest.query({ limit: 1 });
			context.scriptId = latestScripts[0]?.id ?? "";
		}

		if (!context.scriptId) {
			return context;
		}

		context.sessionId = await client.session.createNewSession.mutate(
			context.scriptId,
		);
	}

	return context;
}

async function runScenario({
	client,
	scenarioName,
	modeName,
	preset,
	context,
}) {
	const scenario = scenarioCatalog[scenarioName];
	if (!scenario) {
		throw new Error(`Scenario "${scenarioName}" is not registered`);
	}

	if (scenario.requiresAuth && !context.cookiePresent) {
		return {
			skipped: true,
			reason: "missing auth cookie",
		};
	}

	for (const requirement of scenario.needs) {
		if (!context[requirement]) {
			return {
				skipped: true,
				reason: `missing ${requirement}`,
			};
		}
	}

	const deadline = performance.now() + preset.durationSec * 1000;
	const rampMs = Math.min(5000, preset.durationSec * 200);
	const latencySamples = [];
	const errors = new Map();
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
	const elapsedSec = preset.durationSec;
	const total = completed + failed;
	const requestsPerSecond = total / elapsedSec;

	return {
		skipped: false,
		scenario: scenario.title,
		mode: modeName,
		users: preset.users,
		durationSec: preset.durationSec,
		total,
		completed,
		failed,
		rps: requestsPerSecond,
		p50: percentile(latencySamples, 50),
		p95: percentile(latencySamples, 95),
		p99: percentile(latencySamples, 99),
		errors: Array.from(errors.entries()).sort((left, right) => right[1] - left[1]),
	};
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	if (args.help) {
		printHelp();
		return;
	}

	const scenarioNames = resolveSuiteScenarioNames(args);
	const client = buildClient(args);
	const seed = await seedContext(
		client,
		scenarioNames,
		args.scriptId,
		args.sessionId,
		args.cookie.trim().length > 0,
	);

	const context = {
		...seed,
		cookiePresent: args.cookie.trim().length > 0,
	};

	const modeNames = args.modes
		? args.modes
				.split(",")
				.map((value) => value.trim())
				.filter(Boolean)
		: [args.mode];

	let hadFailures = false;

	for (const modeName of modeNames) {
		const preset = modePresets[modeName];
		if (!preset) {
			throw new Error(
				`Unknown mode "${modeName}". Available: ${Object.keys(modePresets).join(", ")}`,
			);
		}

		const effectivePreset = {
			...preset,
			users: Number.isFinite(args.users) && args.users !== null ? args.users : preset.users,
			durationSec:
				Number.isFinite(args.durationSec) && args.durationSec !== null
					? args.durationSec
					: preset.durationSec,
		};

		console.log(
			`\nMode ${modeName}: ${effectivePreset.users} VU for ${formatDuration(effectivePreset.durationSec)}`,
		);

		for (const scenarioName of scenarioNames) {
			const result = await runScenario({
				client,
				scenarioName,
				modeName,
				preset: effectivePreset,
				context,
			});

			if (result.skipped) {
				console.log(`- ${scenarioName}: skipped (${result.reason})`);
				continue;
			}

			console.log(
				`- ${result.scenario}: ${result.completed} ok, ${result.failed} failed, ${formatNumber(result.rps)} rps, p50 ${formatNumber(result.p50)} ms, p95 ${formatNumber(result.p95)} ms, p99 ${formatNumber(result.p99)} ms`,
			);

			if (result.errors.length > 0) {
				hadFailures = true;
				console.log("  errors:");
				for (const [message, count] of result.errors.slice(0, 5)) {
					console.log(`  - ${count}x ${message}`);
				}
			}
		}
	}

	if (hadFailures) {
		process.exitCode = 1;
	}
}

main().catch((error) => {
	console.error(formatError(error));
	process.exitCode = 1;
});
