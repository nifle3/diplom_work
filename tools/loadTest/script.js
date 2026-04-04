import http from "k6/http";
import { check, group, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";

// ─── Custom metrics ──────────────────────────────────────────────────────────
const latency = new Trend("trpc_latency", true);
const reqOk = new Counter("trpc_ok");
const reqFail = new Counter("trpc_fail");
const errorRate = new Rate("trpc_error_rate");

// ─── Environment ─────────────────────────────────────────────────────────────
const BASE_URL = (__ENV.LOADTEST_BASE_URL || "http://localhost:3001").replace(
	/\/$/,
	"",
);
const COOKIE = __ENV.LOADTEST_COOKIE || "";
const HEADERS_JSON = __ENV.LOADTEST_HEADERS_JSON || "";
const TIMEOUT_MS = __ENV.LOADTEST_TIMEOUT_MS || "30000";
const SCRIPT_ID = __ENV.LOADTEST_SCRIPT_ID || "";
const SESSION_ID = __ENV.LOADTEST_SESSION_ID || "";
const SUITE = __ENV.LOADTEST_SUITE || "core";

// ─── Mode presets ────────────────────────────────────────────────────────────
const MODE_PRESETS = {
	baseline: { vus: 8, duration: "20s" },
	working: { vus: 30, duration: "30s" },
	elevated: { vus: 75, duration: "40s" },
	stress: { vus: 1500, duration: "45s" },
};

const mode = __ENV.LOADTEST_MODE || "baseline";
const preset = MODE_PRESETS[mode];
if (!preset) {
	throw new Error(
		`Unknown mode "${mode}". Available: ${Object.keys(MODE_PRESETS).join(", ")}`,
	);
}

const vus = __ENV.LOADTEST_USERS ? parseInt(__ENV.LOADTEST_USERS, 10) : preset.vus;
const duration = __ENV.LOADTEST_DURATION || preset.duration;

// ─── k6 options ──────────────────────────────────────────────────────────────
export const options = {
	scenarios: {
		load: {
			executor: "constant-vus",
			vus: vus,
			duration: duration,
		},
	},
	thresholds: {
		trpc_latency: ["p(95)<5000"],
		trpc_error_rate: ["rate<0.1"],
	},
};

// ─── Headers ─────────────────────────────────────────────────────────────────
function buildHeaders() {
	const headers = { "Content-Type": "application/json" };
	if (COOKIE) {
		headers["Cookie"] = COOKIE;
	}
	if (HEADERS_JSON.trim()) {
		const extra = JSON.parse(HEADERS_JSON);
		Object.assign(headers, extra);
	}
	return headers;
}

const HEADERS = buildHeaders();

// ─── tRPC helpers ────────────────────────────────────────────────────────────
function trpcQuery(procedure, input, tags) {
	let url = `${BASE_URL}/api/trpc/${procedure}`;
	if (input !== undefined) {
		const encoded = encodeURIComponent(JSON.stringify({ json: input }));
		url += `?input=${encoded}`;
	}

	const res = http.get(url, {
		headers: HEADERS,
		timeout: TIMEOUT_MS,
		tags: tags,
	});

	const ok = res.status === 200;
	latency.add(res.timings.duration, tags);
	reqOk.add(ok ? 1 : 0, tags);
	reqFail.add(ok ? 0 : 1, tags);
	errorRate.add(!ok, tags);

	check(res, { "status is 200": (r) => r.status === 200 });
	return res;
}

function trpcMutate(procedure, input, tags) {
	const url = `${BASE_URL}/api/trpc/${procedure}`;
	const body = JSON.stringify({ json: input });

	const res = http.post(url, body, {
		headers: HEADERS,
		timeout: TIMEOUT_MS,
		tags: tags,
	});

	const ok = res.status === 200;
	latency.add(res.timings.duration, tags);
	reqOk.add(ok ? 1 : 0, tags);
	reqFail.add(ok ? 0 : 1, tags);
	errorRate.add(!ok, tags);

	check(res, { "status is 200": (r) => r.status === 200 });
	return res;
}

// ─── Scenarios ───────────────────────────────────────────────────────────────
const hasAuth = COOKIE.trim().length > 0;

function healthCheck() {
	group("healthCheck", () => {
		trpcQuery("healthCheck", undefined, { name: "healthCheck" });
	});
}

function scriptCategories() {
	if (!hasAuth) return;
	group("script.categories", () => {
		trpcQuery("script.categories", undefined, { name: "script.categories" });
	});
}

function scriptLatest() {
	if (!hasAuth) return;
	group("script.getLatest", () => {
		trpcQuery("script.getLatest", { limit: 5 }, { name: "script.getLatest" });
	});
}

function scriptList() {
	if (!hasAuth) return;
	group("script.list", () => {
		trpcQuery(
			"script.list",
			{ page: 1, limit: 12 },
			{ name: "script.list" },
		);
	});
}

function scriptInfo() {
	if (!hasAuth || !SCRIPT_ID) return;
	group("script.getInfo", () => {
		trpcQuery("script.getInfo", SCRIPT_ID, { name: "script.getInfo" });
	});
}

function userStats() {
	if (!hasAuth) return;
	group("user.getStats", () => {
		trpcQuery("user.getStats", undefined, { name: "user.getStats" });
	});
}

function userStreak() {
	if (!hasAuth) return;
	group("user.getStreak", () => {
		trpcQuery("user.getStreak", undefined, { name: "user.getStreak" });
	});
}

function profileStats() {
	if (!hasAuth) return;
	group("profile.getMyProfileStats", () => {
		trpcQuery("profile.getMyProfileStats", undefined, {
			name: "profile.getMyProfileStats",
		});
	});
}

function profileHistory() {
	if (!hasAuth) return;
	group("profile.getMyHistory", () => {
		trpcQuery("profile.getMyHistory", undefined, {
			name: "profile.getMyHistory",
		});
	});
}

function profileAchievements() {
	if (!hasAuth) return;
	group("profile.getMyAchivements", () => {
		trpcQuery("profile.getMyAchivements", undefined, {
			name: "profile.getMyAchivements",
		});
	});
}

function activityLatest() {
	if (!hasAuth) return;
	group("activity.getLatestUserActivity", () => {
		trpcQuery("activity.getLatestUserActivity", undefined, {
			name: "activity.getLatestUserActivity",
		});
	});
}

function fileUploadLink() {
	if (!hasAuth) return;
	group("file.getUploadLink", () => {
		trpcMutate(
			"file.getUploadLink",
			{ filename: "avatar.png", contentType: "image/png", folder: "avatars" },
			{ name: "file.getUploadLink" },
		);
	});
}

function sessionScript() {
	if (!hasAuth || !SESSION_ID) return;
	group("session.getScriptByInterviewId", () => {
		trpcQuery("session.getScriptByInterviewId", SESSION_ID, {
			name: "session.getScriptByInterviewId",
		});
	});
}

function sessionHistory() {
	if (!hasAuth || !SESSION_ID) return;
	group("session.getAllHistory", () => {
		trpcQuery("session.getAllHistory", SESSION_ID, {
			name: "session.getAllHistory",
		});
	});
}

// ─── Suites ──────────────────────────────────────────────────────────────────
const SUITES = {
	public: [healthCheck],
	catalog: [scriptCategories, scriptLatest, scriptList, scriptInfo],
	user: [
		userStats,
		userStreak,
		profileStats,
		profileHistory,
		profileAchievements,
		activityLatest,
	],
	storage: [fileUploadLink],
	session: [sessionScript, sessionHistory],
	core: [
		healthCheck,
		scriptCategories,
		scriptLatest,
		scriptList,
		scriptInfo,
		userStats,
		userStreak,
		profileStats,
		profileHistory,
		profileAchievements,
		activityLatest,
		fileUploadLink,
	],
	all: [
		healthCheck,
		scriptCategories,
		scriptLatest,
		scriptList,
		scriptInfo,
		userStats,
		userStreak,
		profileStats,
		profileHistory,
		profileAchievements,
		activityLatest,
		fileUploadLink,
		sessionScript,
		sessionHistory,
	],
};

const scenarios = SUITES[SUITE];
if (!scenarios) {
	throw new Error(
		`Unknown suite "${SUITE}". Available: ${Object.keys(SUITES).join(", ")}`,
	);
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function () {
	for (const scenario of scenarios) {
		scenario();
	}
	sleep(0.1);
}
