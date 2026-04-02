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

import { profileRouter } from "./profile";

function createCaller(db: unknown) {
	return profileRouter.createCaller({
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

describe("profileRouter", () => {
	it("returns the current profile", async () => {
		const findFirst = vi.fn().mockResolvedValue({
			id: "user-1",
			name: "Alex",
			email: "alex@example.com",
		});

		await expect(
			createCaller({
				query: {
					usersTable: {
						findFirst,
					},
				},
			}).getMyProfile(),
		).resolves.toEqual({
			id: "user-1",
			name: "Alex",
			email: "alex@example.com",
		});
	});

	it("returns profile stats", async () => {
		const userFindFirst = vi.fn().mockResolvedValue({ xp: 900 });
		const interviewCountSelect = vi.fn().mockReturnValue({
			from: vi.fn().mockReturnValue({
				where: vi.fn().mockResolvedValue([{ value: 11 }]),
			}),
		});
		const achievementCountSelect = vi.fn().mockReturnValue({
			from: vi.fn().mockReturnValue({
				where: vi.fn().mockResolvedValue([{ value: 3 }]),
			}),
		});
		const select = vi
			.fn()
			.mockImplementationOnce(() => interviewCountSelect())
			.mockImplementationOnce(() => achievementCountSelect());

		await expect(
			createCaller({
				query: {
					usersTable: {
						findFirst: userFindFirst,
					},
				},
				select,
			}).getMyProfileStats(),
		).resolves.toEqual({
			xp: 900,
			interviewCount: 11,
			achievementCount: 3,
		});
	});

	it("maps history sessions to finished timestamps", async () => {
		const findMany = vi.fn().mockResolvedValue([
			{
				id: "session-1",
				finalScore: 81,
				expertFeedback: "Great",
				startedAt: new Date("2025-01-01T00:00:00.000Z"),
				statusLogs: [
					{
						statusId: 2,
						createdAt: new Date("2025-01-01T02:00:00.000Z"),
						status: {
							name: "complete",
						},
					},
				],
				script: {
					id: "script-1",
					title: "Frontend",
				},
			},
			{
				id: "session-2",
				finalScore: null,
				expertFeedback: null,
				startedAt: new Date("2025-01-02T00:00:00.000Z"),
				statusLogs: [
					{
						statusId: 1,
						createdAt: new Date("2025-01-02T02:00:00.000Z"),
						status: {
							name: "active",
						},
					},
				],
				script: {
					id: "script-2",
					title: "Backend",
				},
			},
		]);

		await expect(
			createCaller({
				query: {
					interviewSessionsTable: {
						findMany,
					},
				},
			}).getMyHistory(),
		).resolves.toEqual([
			{
				id: "session-1",
				finalScore: 81,
				expertFeedback: "Great",
				startedAt: new Date("2025-01-01T00:00:00.000Z"),
				finishedAt: new Date("2025-01-01T02:00:00.000Z"),
				script: {
					id: "script-1",
					title: "Frontend",
				},
				status: {
					name: "complete",
				},
			},
			{
				id: "session-2",
				finalScore: null,
				expertFeedback: null,
				startedAt: new Date("2025-01-02T00:00:00.000Z"),
				finishedAt: null,
				script: {
					id: "script-2",
					title: "Backend",
				},
				status: {
					name: "active",
				},
			},
		]);
	});

	it("returns achievements in descending award order", async () => {
		const orderBy = vi.fn().mockResolvedValue([
			{
				awardedAt: new Date("2025-01-02T00:00:00.000Z"),
				id: "ach-2",
				name: "Second",
				description: "Second badge",
				iconUrl: "https://example.com/2.png",
			},
		]);
		const where = vi.fn().mockReturnValue({
			orderBy,
		});
		const innerJoin = vi.fn().mockReturnValue({
			where,
		});
		const from = vi.fn().mockReturnValue({
			innerJoin,
		});
		const select = vi.fn().mockReturnValue({
			from,
		});

		await expect(
			createCaller({
				select,
			}).getMyAchivements(),
		).resolves.toEqual([
			{
				awardedAt: new Date("2025-01-02T00:00:00.000Z"),
				id: "ach-2",
				name: "Second",
				description: "Second badge",
				iconUrl: "https://example.com/2.png",
			},
		]);
	});
});
