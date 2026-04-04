import type {
	ModeName,
	ModePreset,
	ScenarioDefinition,
	ScenarioName,
	SuiteName,
} from "./types.ts";

export const modePresets: Record<ModeName, ModePreset> = {
	baseline: { users: 8, durationSec: 20 },
	working: { users: 30, durationSec: 30 },
	elevated: { users: 75, durationSec: 40 },
	stress: { users: 1500, durationSec: 45 },
};

export const scenarioCatalog: Record<ScenarioName, ScenarioDefinition> = {
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

export const suites: Record<SuiteName, ScenarioName[]> = {
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
	all: [
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
		"sessionScript",
		"sessionHistory",
	],
};
