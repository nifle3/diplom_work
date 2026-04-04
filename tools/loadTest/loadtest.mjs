#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import process from "node:process";

const entrypoint = fileURLToPath(new URL("./src/main.ts", import.meta.url));
const result = spawnSync(
	process.execPath,
	["--experimental-strip-types", entrypoint, ...process.argv.slice(2)],
	{
		stdio: "inherit",
	},
);

if (result.error) {
	console.error(result.error);
	process.exitCode = 1;
} else if (result.signal) {
	process.kill(process.pid, result.signal);
} else {
	process.exitCode = result.status ?? 0;
}
