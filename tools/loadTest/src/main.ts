import process from "node:process";
import { buildClient } from "./client.ts";
import { parseArgs, printHelp } from "./args.ts";
import { modePresets } from "./config.ts";
import {
	formatError,
	formatSummary,
	normalizePreset,
	resolveSuiteScenarioNames,
	seedContext,
	runScenario,
} from "./runner.ts";

async function main(argv: string[]) {
	const args = parseArgs(argv);
	if (args.help) {
		printHelp();
		return;
	}

	const scenarioNames = resolveSuiteScenarioNames(args);
	const client = buildClient(args);
	const context = await seedContext(
		client,
		scenarioNames,
		args.scriptId,
		args.sessionId,
		args.cookie.trim().length > 0,
	);

	const modeNames = args.modes
		? args.modes
				.split(",")
				.map((value) => value.trim())
				.filter(Boolean)
		: [args.mode];

	let hadFailures = false;

	for (const modeName of modeNames) {
		if (!(modeName in modePresets)) {
			throw new Error(
				`Unknown mode "${modeName}". Available: ${Object.keys(modePresets).join(", ")}`,
			);
		}

		const preset = normalizePreset(args, modeName as keyof typeof modePresets);

		console.log(
			`\nMode ${modeName}: ${preset.users} VU for ${formatSummary(preset.durationSec)}s`,
		);

		for (const scenarioName of scenarioNames) {
			const result = await runScenario({
				client,
				scenarioName,
				modeName: modeName as keyof typeof modePresets,
				preset,
				context,
			});

			if (result.skipped) {
				console.log(`- ${scenarioName}: skipped (${result.reason})`);
				continue;
			}

			console.log(
				`- ${result.scenario}: ${result.completed} ok, ${result.failed} failed, ${formatSummary(result.rps)} rps, p50 ${formatSummary(result.p50)} ms, p95 ${formatSummary(result.p95)} ms, p99 ${formatSummary(result.p99)} ms`,
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

main(process.argv.slice(2)).catch((error) => {
	console.error(formatError(error));
	process.exitCode = 1;
});
