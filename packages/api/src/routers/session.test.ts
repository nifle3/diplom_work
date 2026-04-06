import {
	chatMessagesTable,
	interviewSessionStatusLogTable,
	interviewSessionsTable,
} from "@diplom_work/db/schema/scheme";
import { statusToId } from "@diplom_work/domain/values/sessionStatus";
import { beforeEach, describe, expect, it, vi } from "vitest";

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

const scriptId = "123e4567-e89b-12d3-a456-426614174000";
const sessionId = "123e4567-e89b-12d3-a456-426614174001";

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
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("creates a new interview session", async () => {
		const scriptsFindFirst = vi.fn().mockResolvedValue({
			context: "System context",
			questions: [
				{
					text: "Tell me about yourself",
				},
			],
		});
		const randomUUID = vi.spyOn(crypto, "randomUUID").mockReturnValue(sessionId);

		const insertSessionReturning = vi.fn().mockResolvedValue([{ id: sessionId }]);
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
		const findMany = vi.fn().mockResolvedValue([]);

		const transaction = vi.fn().mockImplementation(async (callback) => {
			return callback({
				insert,
				query: {
					interviewSessionsTable: {
						findMany,
					},
				},
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

		await expect(caller.createNewSession(scriptId)).resolves.toBe(sessionId);
		expect(randomUUID).toHaveBeenCalledTimes(1);
		expect(findMany).toHaveBeenCalledTimes(1);
		expect(insertSessionValues).toHaveBeenCalledWith(
			expect.objectContaining({
				currentQuestionIndex: 0,
				userId: "user-1",
				scriptId,
				startedAt: expect.any(Date),
			}),
		);
		expect(insertStatusValues).toHaveBeenCalledWith(
			expect.objectContaining({
				sessionId,
				statusId: statusToId.active,
				createdAt: expect.any(Date),
			}),
		);
		expect(insertMessageValues).toHaveBeenCalledWith({
			sessionId,
			isAi: true,
			messageText: "Tell me about yourself",
		});
	});

	it("returns the active interview session when one is already in progress", async () => {
		const scriptsFindFirst = vi.fn().mockResolvedValue({
			context: "System context",
			questions: [
				{
					text: "Tell me about yourself",
				},
			],
		});
		vi.spyOn(crypto, "randomUUID").mockReturnValue(
			"123e4567-e89b-12d3-a456-426614174099",
		);

		const findMany = vi.fn().mockResolvedValue([
			{
				id: sessionId,
				statusLogs: [
					{
						statusId: statusToId.active,
						createdAt: new Date(),
					},
				],
			},
		]);
		const insert = vi.fn();
		const transaction = vi.fn().mockImplementation(async (callback) =>
			callback({
				insert,
				query: {
					interviewSessionsTable: {
						findMany,
					},
				},
			}),
		);

		await expect(
			createCaller({
				query: {
					scriptsTable: {
						findFirst: scriptsFindFirst,
					},
				},
				transaction,
			}).createNewSession(scriptId),
		).resolves.toBe(sessionId);
		expect(insert).not.toHaveBeenCalled();
		expect(findMany).toHaveBeenCalledTimes(1);
	});

	it("returns the script for an interview session", async () => {
		const findFirst = vi.fn().mockResolvedValue({
			script: {
				id: scriptId,
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
			}).getScriptByInterviewId(sessionId),
		).resolves.toEqual({
			id: scriptId,
			title: "Frontend interview",
		});
	});
});
