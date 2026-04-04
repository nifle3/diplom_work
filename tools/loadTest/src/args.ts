import process from "node:process";
import type { LoadTestArgs } from "./types.ts";

export function parseArgs(argv: string[]) {
	const result: LoadTestArgs = {
		baseUrl: process.env.LOADTEST_BASE_URL ?? "http://localhost:3001",
		cookie: process.env.LOADTEST_COOKIE ?? "",
		headersJson: process.env.LOADTEST_HEADERS_JSON ?? "",
		timeoutMs: Number(process.env.LOADTEST_TIMEOUT_MS ?? "30000"),
		suite: (process.env.LOADTEST_SUITE ?? "core") as LoadTestArgs["suite"],
		scenario: process.env.LOADTEST_SCENARIO ?? "",
		mode: (process.env.LOADTEST_MODE ?? "baseline") as LoadTestArgs["mode"],
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
				result.suite = readValue() as LoadTestArgs["suite"];
				break;
			case "scenario":
				result.scenario = readValue();
				break;
			case "mode":
				result.mode = readValue() as LoadTestArgs["mode"];
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

export function printHelp() {
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
