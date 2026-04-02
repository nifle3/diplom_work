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

import { categoryRouter } from "./category";

function createCaller(db: unknown) {
	return categoryRouter.createCaller({
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

describe("categoryRouter", () => {
	it("returns active categories", async () => {
		const findMany = vi
			.fn()
			.mockResolvedValue([{ id: 1, name: "Frontend", deletedAt: null }]);

		const result = await createCaller({
			query: {
				categoriesTable: {
					findMany,
				},
			},
		});

		await expect(result.getAll()).resolves.toEqual([
			{ id: 1, name: "Frontend", deletedAt: null },
		]);
		expect(findMany).toHaveBeenCalledTimes(1);
	});

	it("creates a category", async () => {
		const values = vi.fn().mockResolvedValue(undefined);
		const insert = vi.fn().mockReturnValue({
			values,
		});

		const caller = createCaller({
			insert,
		});

		await expect(caller.create("Node.js")).resolves.toBeUndefined();
		expect(insert).toHaveBeenCalledTimes(1);
		expect(values).toHaveBeenCalledWith(
			expect.objectContaining({
				name: "Node.js",
				createdAt: expect.any(Date),
			}),
		);
		expect(mocks.loggerInfo).toHaveBeenCalledWith(
			{ name: "Node.js" },
			"Created category",
		);
	});

	it("updates a category by id", async () => {
		const where = vi.fn().mockResolvedValue(true);
		const set = vi.fn().mockReturnValue({
			where,
		});
		const update = vi.fn().mockReturnValue({
			set,
		});

		const caller = createCaller({
			update,
		});

		await expect(
			caller.updateById({
				id: 7,
				name: "Backend",
			}),
		).resolves.toBeUndefined();

		expect(update).toHaveBeenCalledTimes(1);
		expect(set).toHaveBeenCalledWith(
			expect.objectContaining({
				name: "Backend",
				updatedAt: expect.any(Date),
			}),
		);
		expect(mocks.loggerInfo).toHaveBeenCalledWith(
			{ categoryId: 7 },
			"Updated category",
		);
	});

	it("deletes a category by id", async () => {
		const returning = vi.fn().mockResolvedValue([{ id: 7 }]);
		const where = vi.fn().mockReturnValue({
			returning,
		});
		const set = vi.fn().mockReturnValue({
			where,
		});
		const update = vi.fn().mockReturnValue({
			set,
		});

		const caller = createCaller({
			update,
		});

		await expect(caller.deleteById(7)).resolves.toBeUndefined();

		expect(returning).toHaveBeenCalledTimes(1);
		expect(mocks.loggerInfo).toHaveBeenCalledWith(
			{ categoryId: 7 },
			"Deleted category",
		);
	});
});
