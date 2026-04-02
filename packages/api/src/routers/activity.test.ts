import { describe, expect, it, vi } from "vitest";

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

import { activityRouter } from "./activity";

describe("activityRouter.getLatestUserActivity", () => {
	it("returns the three newest finished sessions", async () => {
		const findMany = vi.fn().mockResolvedValue([
			{
				id: "session-old",
				script: {
					title: "Old interview",
				},
				statusLogs: [
					{
						statusId: 2,
						createdAt: new Date("2025-01-01T10:00:00.000Z"),
					},
				],
			},
			{
				id: "session-draft",
				script: {
					title: "Draft interview",
				},
				statusLogs: [
					{
						statusId: 1,
						createdAt: new Date("2025-01-03T10:00:00.000Z"),
					},
				],
			},
			{
				id: "session-newest",
				script: {
					title: "Newest interview",
				},
				statusLogs: [
					{
						statusId: 3,
						createdAt: new Date("2025-01-05T10:00:00.000Z"),
					},
				],
			},
			{
				id: "session-mid",
				script: {
					title: "Middle interview",
				},
				statusLogs: [
					{
						statusId: 2,
						createdAt: new Date("2025-01-04T10:00:00.000Z"),
					},
				],
			},
		]);

		const caller = activityRouter.createCaller({
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
			db: {
				query: {
					interviewSessionsTable: {
						findMany,
					},
				},
			} as never,
			file: {} as never,
			llm: {} as never,
		} as never);

		const result = await caller.getLatestUserActivity();

		expect(findMany).toHaveBeenCalledTimes(1);
		expect(result).toEqual([
			{
				id: "session-newest",
				title: "Newest interview",
				date: new Date("2025-01-05T10:00:00.000Z"),
			},
			{
				id: "session-mid",
				title: "Middle interview",
				date: new Date("2025-01-04T10:00:00.000Z"),
			},
			{
				id: "session-old",
				title: "Old interview",
				date: new Date("2025-01-01T10:00:00.000Z"),
			},
		]);
	});
});
