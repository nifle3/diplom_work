export type ModeName = "baseline" | "working" | "elevated" | "stress";

export type SuiteName =
	| "public"
	| "catalog"
	| "user"
	| "storage"
	| "session"
	| "core"
	| "all";

export type ScenarioName =
	| "healthCheck"
	| "scriptCategories"
	| "scriptLatest"
	| "scriptList"
	| "scriptInfo"
	| "userStats"
	| "userStreak"
	| "profileStats"
	| "profileHistory"
	| "profileAchievements"
	| "activityLatest"
	| "fileUploadLink"
	| "sessionScript"
	| "sessionHistory";

export type ScenarioKey = "scriptId" | "sessionId";

export interface ModePreset {
	users: number;
	durationSec: number;
}

export interface LoadTestArgs {
	baseUrl: string;
	cookie: string;
	headersJson: string;
	timeoutMs: number;
	suite: SuiteName;
	scenario: string;
	mode: ModeName;
	modes: string;
	users: number | null;
	durationSec: number | null;
	scriptId: string;
	sessionId: string;
	help?: boolean;
}

export interface LoadTestContext {
	scriptId: string;
	sessionId: string;
	cookiePresent: boolean;
}

export interface LoadTestClient {
	healthCheck: {
		query: () => Promise<unknown>;
	};
	script: {
		categories: {
			query: () => Promise<unknown>;
		};
		getLatest: {
			query: (input: { limit: number }) => Promise<Array<{ id: string }>>;
		};
		list: {
			query: (input: { page: number; limit: number }) => Promise<unknown>;
		};
		getInfo: {
			query: (input: string) => Promise<unknown>;
		};
	};
	user: {
		getStats: {
			query: () => Promise<unknown>;
		};
		getStreak: {
			query: () => Promise<unknown>;
		};
	};
	profile: {
		getMyProfileStats: {
			query: () => Promise<unknown>;
		};
		getMyHistory: {
			query: () => Promise<unknown>;
		};
		getMyAchivements: {
			query: () => Promise<unknown>;
		};
	};
	activity: {
		getLatestUserActivity: {
			query: () => Promise<unknown>;
		};
	};
	file: {
		getUploadLink: {
			mutate: (input: {
				filename: string;
				contentType: string;
				folder: "avatars" | "scripts";
			}) => Promise<unknown>;
		};
	};
	session: {
		getScriptByInterviewId: {
			query: (input: string) => Promise<unknown>;
		};
		getAllHistory: {
			query: (input: string) => Promise<unknown>;
		};
		createNewSession: {
			mutate: (input: string) => Promise<string>;
		};
	};
}

export interface ScenarioDefinition {
	label: string;
	title: string;
	requiresAuth: boolean;
	needs: ScenarioKey[];
	run: (client: LoadTestClient, context: LoadTestContext) => Promise<unknown>;
}
