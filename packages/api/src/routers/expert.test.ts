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

import { expertRouter } from "./expert";

function createCaller(db: unknown, userId = "expert-1") {
	return expertRouter.createCaller({
		requestId: "req-1",
		clientIp: "127.0.0.1",
		userAgent: "vitest",
		session: {
			user: {
				id: userId,
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

describe("expertRouter", () => {
	it("returns a full script for its creator", async () => {
		const findFirst = vi.fn().mockResolvedValue({
			id: "script-1",
			expertId: "expert-1",
			title: "Backend interview",
			category: {
				id: 10,
				name: "Backend",
			},
			globalCriteria: [],
			questions: [],
		});

		const caller = createCaller({
			query: {
				scriptsTable: {
					findFirst,
				},
			},
		});

		await expect(caller.getFullScript("script-1")).resolves.toEqual(
			expect.objectContaining({
				id: "script-1",
				expertId: "expert-1",
			}),
		);
	});

	it("creates a new draft script", async () => {
		const returning = vi.fn().mockResolvedValue([
			{
				id: "draft-1",
			},
		]);
		const values = vi.fn().mockReturnValue({
			returning,
		});
		const insert = vi.fn().mockReturnValue({
			values,
		});

		const caller = createCaller({
			insert,
		});

		await expect(caller.createNewDraft()).resolves.toBe("draft-1");
		expect(mocks.loggerInfo).toHaveBeenCalledWith(
			{ scriptId: "draft-1", expertId: "expert-1" },
			"Created new draft script",
		);
	});

	it("returns only the current user's drafts", async () => {
		const orderBy = vi.fn().mockResolvedValue([
			{
				id: "draft-1",
				title: "Draft 1",
				context: "Context",
				categoryName: "Backend",
				createdAt: new Date("2025-01-01T00:00:00.000Z"),
			},
		]);
		const where = vi.fn().mockReturnValue({
			orderBy,
		});
		const leftJoin = vi.fn().mockReturnValue({
			where,
		});
		const from = vi.fn().mockReturnValue({
			leftJoin,
		});
		const select = vi.fn().mockReturnValue({
			from,
		});

		const caller = createCaller({
			select,
		});

		await expect(caller.getMyDrafts()).resolves.toEqual([
			{
				id: "draft-1",
				title: "Draft 1",
				context: "Context",
				categoryName: "Backend",
				createdAt: new Date("2025-01-01T00:00:00.000Z"),
			},
		]);
	});

	it("returns only the current user's published scripts", async () => {
		const orderBy = vi.fn().mockResolvedValue([
			{
				id: "script-1",
				title: "Script 1",
				context: "Context",
				categoryName: "Frontend",
				createdAt: new Date("2025-01-02T00:00:00.000Z"),
			},
		]);
		const where = vi.fn().mockReturnValue({
			orderBy,
		});
		const leftJoin = vi.fn().mockReturnValue({
			where,
		});
		const from = vi.fn().mockReturnValue({
			leftJoin,
		});
		const select = vi.fn().mockReturnValue({
			from,
		});

		const caller = createCaller({
			select,
		});

		await expect(caller.getMyScripts()).resolves.toEqual([
			{
				id: "script-1",
				title: "Script 1",
				context: "Context",
				categoryName: "Frontend",
				createdAt: new Date("2025-01-02T00:00:00.000Z"),
			},
		]);
	});
});
