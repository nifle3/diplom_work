#!/usr/bin/env node
/**
 * Seed script — resolves LOADTEST_SCRIPT_ID and LOADTEST_SESSION_ID
 * via tRPC before launching k6, so the load test can hit session-related endpoints.
 *
 * Usage:
 *   nix develop -c node tools/loadTest/seed.mjs [k6 args...]
 *
 * It will call the API to fetch a scriptId (and optionally create a session),
 * then exec `k6 run tools/loadTest/script.js` with the resolved env vars.
 */
import { execSync } from "node:child_process";
import process from "node:process";

const BASE_URL = (process.env.LOADTEST_BASE_URL || "http://localhost:3001").replace(/\/$/, "");
const COOKIE = process.env.LOADTEST_COOKIE || "";
const SUITE = process.env.LOADTEST_SUITE || "core";

const needsScript = ["catalog", "core", "all", "session"].includes(SUITE);
const needsSession = ["session", "all"].includes(SUITE);

async function trpcQuery(procedure, input) {
	let url = `${BASE_URL}/api/trpc/${procedure}`;
	if (input !== undefined) {
		url += `?input=${encodeURIComponent(JSON.stringify({ json: input }))}`;
	}
	const res = await fetch(url, {
		headers: {
			"Content-Type": "application/json",
			...(COOKIE ? { Cookie: COOKIE } : {}),
		},
	});
	if (!res.ok) {
		throw new Error(`${procedure} failed: ${res.status} ${res.statusText}`);
	}
	const body = await res.json();
	return body.result?.data?.json ?? body.result?.data;
}

async function trpcMutate(procedure, input) {
	const url = `${BASE_URL}/api/trpc/${procedure}`;
	const res = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			...(COOKIE ? { Cookie: COOKIE } : {}),
		},
		body: JSON.stringify({ json: input }),
	});
	if (!res.ok) {
		throw new Error(`${procedure} failed: ${res.status} ${res.statusText}`);
	}
	const body = await res.json();
	return body.result?.data?.json ?? body.result?.data;
}

async function main() {
	const env = { ...process.env };

	if (COOKIE && needsScript && !env.LOADTEST_SCRIPT_ID) {
		console.log("Seeding: fetching scriptId...");
		const scripts = await trpcQuery("script.getLatest", { limit: 1 });
		const scriptId = Array.isArray(scripts) ? scripts[0]?.id : "";
		if (scriptId) {
			env.LOADTEST_SCRIPT_ID = scriptId;
			console.log(`  scriptId = ${scriptId}`);
		} else {
			console.log("  no scripts found, skipping scriptId");
		}
	}

	if (COOKIE && needsSession && !env.LOADTEST_SESSION_ID) {
		const scriptId = env.LOADTEST_SCRIPT_ID;
		if (scriptId) {
			console.log("Seeding: creating session...");
			const sessionId = await trpcMutate("session.createNewSession", scriptId);
			if (sessionId) {
				env.LOADTEST_SESSION_ID = sessionId;
				console.log(`  sessionId = ${sessionId}`);
			}
		} else {
			console.log("  no scriptId available, skipping sessionId");
		}
	}

	const k6Args = process.argv.slice(2);
	const cmd = [
		"k6",
		"run",
		...k6Args,
		"tools/loadTest/script.js",
	].join(" ");

	console.log(`\nRunning: ${cmd}\n`);
	try {
		execSync(cmd, { stdio: "inherit", env });
	} catch (e) {
		process.exitCode = e.status || 1;
	}
}

main().catch((err) => {
	console.error(err);
	process.exitCode = 1;
});
