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

import { expertManagerRouter } from "./expertManager";

function createCaller(db: unknown) {
	return expertManagerRouter.createCaller({
		requestId: "req-1",
		clientIp: "127.0.0.1",
		userAgent: "vitest",
		session: {
			user: {
				id: "admin-1",
			},
			session: {
				role: "admin",
			},
		},
		setCookieHeaders: [],
		auth: {} as never,
		db,
		file: {} as never,
		llm: {} as never,
	} as never);
}

describe("expertManagerRouter", () => {
	it("lists expert users", async () => {
		const findMany = vi.fn().mockResolvedValue([
			{
				id: "expert-1",
				name: "Expert",
				role: {
					name: "expert",
				},
			},
		]);

		await expect(
			createCaller({
				query: {
					usersTable: {
						findMany,
					},
				},
			}).getAll(),
		).resolves.toEqual([
			{
				id: "expert-1",
				name: "Expert",
				role: {
					name: "expert",
				},
			},
		]);
	});

	it("promotes a user to expert", async () => {
		const returning = vi.fn().mockResolvedValue([{ id: "user-1" }]);
		const where = vi.fn().mockReturnValue({
			returning,
		});
		const set = vi.fn().mockReturnValue({
			where,
		});
		const update = vi.fn().mockReturnValue({
			set,
		});

		await expect(
			createCaller({
				update,
			}).setUserExpert("person@example.com"),
		).resolves.toBeUndefined();
		expect(returning).toHaveBeenCalledTimes(1);
	});

	it("demotes an expert to a regular user", async () => {
		const returning = vi.fn().mockResolvedValue([{ id: "user-1" }]);
		const where = vi.fn().mockReturnValue({
			returning,
		});
		const set = vi.fn().mockReturnValue({
			where,
		});
		const update = vi.fn().mockReturnValue({
			set,
		});

		await expect(
			createCaller({
				update,
			}).unsetUserExpert("123e4567-e89b-12d3-a456-426614174000"),
		).resolves.toBeUndefined();
		expect(returning).toHaveBeenCalledTimes(1);
	});
});
