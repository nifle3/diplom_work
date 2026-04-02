import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	assertAchievementFormulaIsValid: vi.fn(),
	syncAllUserAchievements: vi.fn(),
	loggerInfo: vi.fn(),
	loggerError: vi.fn(),
}));

vi.mock("../achievements/formula", () => ({
	assertAchievementFormulaIsValid: mocks.assertAchievementFormulaIsValid,
}));

vi.mock("../achievements/metrics", () => ({
	syncAllUserAchievements: mocks.syncAllUserAchievements,
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

import { achievementRouter } from "./achievement";

function createCaller(db: unknown) {
	return achievementRouter.createCaller({
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

describe("achievementRouter", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("lists achievements with awarded counts", async () => {
		const orderBy = vi.fn().mockResolvedValue([
			{
				id: "ach-1",
				name: "First badge",
				description: "Description",
				iconUrl: null,
				formula: "xp >= 100",
				createdAt: new Date("2025-01-01T00:00:00.000Z"),
				updatedAt: new Date("2025-01-01T00:00:00.000Z"),
				awardedCount: 2,
			},
		]);
		const groupBy = vi.fn().mockReturnValue({
			orderBy,
		});
		const leftJoin = vi.fn().mockReturnValue({
			groupBy,
		});
		const from = vi.fn().mockReturnValue({
			leftJoin,
		});
		const select = vi.fn().mockReturnValue({
			from,
		});

		await expect(
			createCaller({
				select,
			}).getAll(),
		).resolves.toEqual([
			{
				id: "ach-1",
				name: "First badge",
				description: "Description",
				iconUrl: null,
				formula: "xp >= 100",
				createdAt: new Date("2025-01-01T00:00:00.000Z"),
				updatedAt: new Date("2025-01-01T00:00:00.000Z"),
				awardedCount: 2,
			},
		]);
	});

	it("creates an achievement after validating the formula", async () => {
		const returning = vi.fn().mockResolvedValue([
			{
				id: "ach-new",
			},
		]);
		const values = vi.fn().mockReturnValue({
			returning,
		});
		const insert = vi.fn().mockReturnValue({
			values,
		});
		mocks.syncAllUserAchievements.mockResolvedValue(undefined);

		await expect(
			createCaller({
				insert,
			}).create({
				name: "New badge",
				description: "Long enough description",
				iconUrl: null,
				formula: "xp >= 1000",
			}),
		).resolves.toEqual({ id: "ach-new" });

		expect(mocks.assertAchievementFormulaIsValid).toHaveBeenCalledWith(
			"xp >= 1000",
		);
		expect(mocks.syncAllUserAchievements).toHaveBeenCalledTimes(1);
		expect(mocks.loggerInfo).toHaveBeenCalledWith(
			{ achievementId: "ach-new", name: "New badge" },
			"Created achievement",
		);
	});

	it("updates an achievement by id", async () => {
		const returning = vi.fn().mockResolvedValue([
			{
				id: "ach-1",
			},
		]);
		const where = vi.fn().mockReturnValue({
			returning,
		});
		const set = vi.fn().mockReturnValue({
			where,
		});
		const update = vi.fn().mockReturnValue({
			set,
		});
		mocks.syncAllUserAchievements.mockResolvedValue(undefined);

		await expect(
			createCaller({
				update,
			}).updateById({
				id: "123e4567-e89b-12d3-a456-426614174000",
				name: "Updated badge",
				description: "Updated description",
				iconUrl: "https://example.com/icon.png",
				formula: "xp >= 2000",
			}),
		).resolves.toEqual({ id: "ach-1" });

		expect(mocks.assertAchievementFormulaIsValid).toHaveBeenCalledWith(
			"xp >= 2000",
		);
		expect(mocks.syncAllUserAchievements).toHaveBeenCalledTimes(1);
		expect(mocks.loggerInfo).toHaveBeenCalledWith(
			{ achievementId: "ach-1", name: "Updated badge" },
			"Updated achievement",
		);
	});

	it("recalculates achievements for all users", async () => {
		mocks.syncAllUserAchievements.mockResolvedValue({
			recalculated: true,
		});

		await expect(
			createCaller({
				select: vi.fn(),
			}).recalculateAll(),
		).resolves.toEqual({ recalculated: true });

		expect(mocks.syncAllUserAchievements).toHaveBeenCalledTimes(1);
		expect(mocks.loggerInfo).toHaveBeenCalledWith("Recalculated all achievements");
	});
});
