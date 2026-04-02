import { describe, expect, it, vi } from "vitest";
import {
	chatMessagesTable,
	interviewSessionStatusLogTable,
	interviewSessionsTable,
} from "@diplom_work/db/schema/scheme";

const mocks = vi.hoisted(() => ({
	loggerInfo: vi.fn(),
	loggerError: vi.fn(),
}));

vi.mock("@diplom_work/env/server", () => ({
	env: {
		NODE_ENV: "test",
		RATE_LIMIT_ENABLE: false,
	},
}));

vi.mock("@diplom_work/ratelimit", () => ({
	globalRateLimit: {
		limit: vi.fn(),
	},
	llmRateLimit: {
		limit: vi.fn(),
	},
}));

vi.mock("@diplom_work/logger/server", () => ({
	logger: {
		info: mocks.loggerInfo,
		error: mocks.loggerError,
	},
	loggerStore: {
		run: (_context: unknown, callback: () => unknown) => callback(),
		getStore: () => undefined,
	},
}));

vi.mock("../achievements/metrics", () => ({
	syncUserAchievements: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./sessionExperience", () => ({
	calculateInterviewExperience: vi.fn().mockReturnValue(0),
}));

import { sessionRouter } from "./session";

function createCaller(db: unknown) {
	return sessionRouter.createCaller({
		requestId: "req-1",
		clientIp: "127.0.0.1",
		userAgent: "vitest",
		session: {
			user: {
				id: "user-1",
			},
			session: {
				role: "expert",
			},
		},
		setCookieHeaders: [],
		auth: {} as never,
		db,
		file: {} as never,
		llm: {
			evaluateAnswer: vi.fn(),
			planInterviewStep: vi.fn(),
			summarize: vi.fn(),
		},
	} as never);
}

describe("sessionRouter", () => {
	it("creates a new interview session", async () => {
		const scriptsFindFirst = vi.fn().mockResolvedValue({
			context: "System context",
			questions: [
				{
					text: "Tell me about yourself",
				},
			],
		});

		const insertSessionReturning = vi.fn().mockResolvedValue([
			{
				id: "session-1",
			},
		]);
		const insertSessionValues = vi.fn().mockReturnValue({
			returning: insertSessionReturning,
		});
		const insertStatusValues = vi.fn().mockReturnValue(undefined);
		const insertMessageValues = vi.fn().mockReturnValue(undefined);
		const insert = vi.fn().mockImplementation((table: unknown) => {
			if (table === interviewSessionsTable) {
				return {
					values: insertSessionValues,
				};
			}

			if (table === interviewSessionStatusLogTable) {
				return {
					values: insertStatusValues,
				};
			}

			if (table === chatMessagesTable) {
				return {
					values: insertMessageValues,
				};
			}

			throw new Error("Unexpected insert table");
		});

		const transaction = vi.fn().mockImplementation(async (callback) => {
			return callback({
				insert,
			});
		});

		const caller = createCaller({
			query: {
				scriptsTable: {
					findFirst: scriptsFindFirst,
				},
			},
			transaction,
		});

		await expect(caller.createNewSession("script-1")).resolves.toBe("session-1");
		expect(insertSessionValues).toHaveBeenCalledWith(
			expect.objectContaining({
				currentQuestionIndex: 0,
				userId: "user-1",
				scriptId: "script-1",
				startedAt: expect.any(Date),
			}),
		);
		expect(insertStatusValues).toHaveBeenCalledWith(
			expect.objectContaining({
				sessionId: "session-1",
				createdAt: expect.any(Date),
			}),
		);
		expect(insertMessageValues).toHaveBeenCalledWith({
			sessionId: "session-1",
			isAi: true,
			messageText: "Tell me about yourself",
		});
	});

	it("returns the script for an interview session", async () => {
		const findFirst = vi.fn().mockResolvedValue({
			script: {
				id: "script-1",
				title: "Frontend interview",
			},
		});

		await expect(
			createCaller({
				query: {
					interviewSessionsTable: {
						findFirst,
					},
				},
			}).getScriptByInterviewId("session-1"),
		).resolves.toEqual({
			id: "script-1",
			title: "Frontend interview",
		});
	});
});
