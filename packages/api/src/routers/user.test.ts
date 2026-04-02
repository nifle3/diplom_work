import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	calculateStreakFromSessions: vi.fn(),
	loggerInfo: vi.fn(),
	loggerError: vi.fn(),
}));

vi.mock("../achievements/metrics", () => ({
	calculateStreakFromSessions: mocks.calculateStreakFromSessions,
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

import { userRouter } from "./user";

function createCaller(db: unknown) {
	return userRouter.createCaller({
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
		llm: {} as never,
	} as never);
}

describe("userRouter", () => {
	it("returns basic user stats", async () => {
		const limit = vi.fn().mockResolvedValue([
			{
				name: "Alex",
				xp: 420,
			},
		]);
		const where = vi.fn().mockReturnValue({
			limit,
		});
		const from = vi.fn().mockReturnValue({
			where,
		});
		const select = vi.fn().mockReturnValue({
			from,
		});

		const caller = createCaller({
			select,
		});

		await expect(caller.getStats()).resolves.toEqual({
			name: "Alex",
			xp: 420,
		});
		expect(select).toHaveBeenCalledTimes(1);
	});

	it("delegates streak calculation to the metrics helper", async () => {
		mocks.calculateStreakFromSessions.mockReturnValue(5);

		const findMany = vi.fn().mockResolvedValue([
			{
				id: "session-1",
				startedAt: new Date("2025-01-01T00:00:00.000Z"),
				finalScore: 78,
				statusLogs: [
					{
						statusId: 2,
						createdAt: new Date("2025-01-01T01:00:00.000Z"),
					},
				],
			},
		]);

		const caller = createCaller({
			query: {
				interviewSessionsTable: {
					findMany,
				},
			},
		});

		await expect(caller.getStreak()).resolves.toBe(5);
		expect(mocks.calculateStreakFromSessions).toHaveBeenCalledWith([
			{
				id: "session-1",
				startedAt: new Date("2025-01-01T00:00:00.000Z"),
				finalScore: 78,
				statusLogs: [
					{
						statusId: 2,
						createdAt: new Date("2025-01-01T01:00:00.000Z"),
					},
				],
			},
		]);
		expect(findMany).toHaveBeenCalledTimes(1);
	});
});
