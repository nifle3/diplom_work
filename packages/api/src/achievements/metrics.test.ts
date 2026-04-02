import { beforeEach, describe, expect, it, vi } from "vitest";
import { statusToId } from "@diplom_work/domain/values/sessionStatus";

const mocks = vi.hoisted(() => ({
	evaluateAchievementFormula: vi.fn(),
	loggerWarn: vi.fn(),
}));

vi.mock("./formula", () => ({
	evaluateAchievementFormula: mocks.evaluateAchievementFormula,
}));

vi.mock("@diplom_work/logger/server", () => ({
	logger: {
		warn: mocks.loggerWarn,
		info: vi.fn(),
		error: vi.fn(),
	},
	loggerStore: {
		run: (_context: unknown, callback: () => unknown) => callback(),
		getStore: () => undefined,
	},
}));

import {
	calculateStreakFromSessions,
	syncAllUserAchievements,
	syncUserAchievements,
} from "./metrics";

describe("calculateStreakFromSessions", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2025-01-10T12:00:00.000Z"));
	});

	it("returns zero when there are no completed sessions", () => {
		expect(
			calculateStreakFromSessions([
				{
					startedAt: new Date("2025-01-10T08:00:00.000Z"),
					finalScore: null,
					statusLogs: [
						{
							statusId: statusToId.active,
							createdAt: new Date("2025-01-10T09:00:00.000Z"),
						},
					],
				},
			]),
		).toBe(0);
	});

	it("counts a streak that starts today and skips duplicate same-day completions", () => {
		expect(
			calculateStreakFromSessions([
				{
					startedAt: new Date("2025-01-10T08:00:00.000Z"),
					finalScore: 90,
					statusLogs: [
						{
							statusId: statusToId.complete,
							createdAt: new Date("2025-01-10T09:00:00.000Z"),
						},
					],
				},
				{
					startedAt: new Date("2025-01-10T06:00:00.000Z"),
					finalScore: 80,
					statusLogs: [
						{
							statusId: statusToId.complete,
							createdAt: new Date("2025-01-10T07:00:00.000Z"),
						},
					],
				},
				{
					startedAt: new Date("2025-01-09T08:00:00.000Z"),
					finalScore: 88,
					statusLogs: [
						{
							statusId: statusToId.complete,
							createdAt: new Date("2025-01-09T09:00:00.000Z"),
						},
					],
				},
			]),
		).toBe(2);
	});

	it("counts a streak that starts yesterday", () => {
		expect(
			calculateStreakFromSessions([
				{
					startedAt: new Date("2025-01-09T08:00:00.000Z"),
					finalScore: 90,
					statusLogs: [
						{
							statusId: statusToId.complete,
							createdAt: new Date("2025-01-09T10:00:00.000Z"),
						},
					],
				},
				{
					startedAt: new Date("2025-01-08T08:00:00.000Z"),
					finalScore: 91,
					statusLogs: [
						{
							statusId: statusToId.complete,
							createdAt: new Date("2025-01-08T10:00:00.000Z"),
						},
					],
				},
			]),
		).toBe(2);
	});

	it("returns zero when the latest completed session is too old", () => {
		expect(
			calculateStreakFromSessions([
				{
					startedAt: new Date("2025-01-07T08:00:00.000Z"),
					finalScore: 90,
					statusLogs: [
						{
							statusId: statusToId.complete,
							createdAt: new Date("2025-01-07T09:00:00.000Z"),
						},
					],
				},
			]),
		).toBe(0);
	});
});

describe("syncUserAchievements", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2025-01-10T12:00:00.000Z"));
		vi.clearAllMocks();
	});

	it("returns zero when the user does not exist", async () => {
		const client = {
			query: {
				usersTable: {
					findFirst: vi.fn().mockResolvedValue(null),
				},
				interviewSessionsTable: {
					findMany: vi.fn(),
				},
				achievementsTable: {
					findMany: vi.fn(),
				},
			},
			select: vi.fn().mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([{ value: 0 }]),
				}),
			}),
			insert: vi.fn(),
		} as never;

		await expect(syncUserAchievements(client, "missing-user")).resolves.toBe(0);
	});

	it("awards new achievements and skips invalid formulas", async () => {
		const insertValues = vi.fn().mockResolvedValue(undefined);
		const insert = vi.fn().mockReturnValue({
			values: insertValues,
		});
		const existingAwardSelect = vi.fn().mockReturnValue({
			from: vi.fn().mockReturnValue({
				where: vi.fn().mockResolvedValue([{ achievementId: "existing-ach" }]),
			}),
		});
		const countSelect = vi.fn().mockReturnValue({
			from: vi.fn().mockReturnValue({
				where: vi.fn().mockResolvedValue([{ value: 1 }]),
			}),
		});
		const select = vi
			.fn()
			.mockImplementationOnce(() => countSelect())
			.mockImplementationOnce(() => existingAwardSelect())
			.mockImplementationOnce(() => countSelect())
			.mockImplementationOnce(() => existingAwardSelect());

		const session = {
			startedAt: new Date("2025-01-10T07:00:00.000Z"),
			finalScore: 91,
			statusLogs: [
				{
					statusId: statusToId.complete,
					createdAt: new Date("2025-01-10T09:00:00.000Z"),
				},
			],
		};

		const client = {
			query: {
				usersTable: {
					findFirst: vi.fn().mockResolvedValue({
						id: "user-1",
						xp: 1000,
					}),
				},
				interviewSessionsTable: {
					findMany: vi.fn().mockResolvedValue([session]),
				},
				achievementsTable: {
					findMany: vi.fn().mockResolvedValue([
						{
							id: "existing-ach",
							name: "Existing",
							formula: "xp > 0",
						},
						{
							id: "new-ach",
							name: "New",
							formula: "xp >= 1000",
						},
						{
							id: "bad-ach",
							name: "Bad",
							formula: "bad formula",
						},
					]),
				},
			},
			select,
			insert,
		} as never;

		mocks.evaluateAchievementFormula.mockImplementation((formula: string) => {
			if (formula === "xp >= 1000") {
				return true;
			}

			throw new Error("Invalid formula");
		});

		await expect(syncUserAchievements(client, "user-1")).resolves.toBe(1);
		expect(insertValues).toHaveBeenCalledWith([
			{
				userId: "user-1",
				achievementId: "new-ach",
			},
		]);
		expect(mocks.loggerWarn).toHaveBeenCalledWith(
			expect.objectContaining({
				achievementId: "bad-ach",
				achievementName: "Bad",
			}),
			"Skipping invalid achievement formula",
		);
	});
});

describe("syncAllUserAchievements", () => {
	it("processes every user", async () => {
		let selectCall = 0;
		const client = {
			query: {
				usersTable: {
					findFirst: vi.fn().mockResolvedValue({
						id: "user-1",
						xp: 1000,
					}),
				},
				interviewSessionsTable: {
					findMany: vi.fn().mockResolvedValue([
						{
							startedAt: new Date("2025-01-10T07:00:00.000Z"),
							finalScore: 91,
							statusLogs: [
								{
									statusId: statusToId.complete,
									createdAt: new Date("2025-01-10T09:00:00.000Z"),
								},
							],
						},
					]),
				},
				achievementsTable: {
					findMany: vi.fn().mockResolvedValue([
						{
							id: "new-ach",
							name: "New",
							formula: "xp >= 1000",
						},
					]),
				},
			},
			select: vi.fn().mockImplementation(() => {
				selectCall++;
				if (selectCall === 1) {
					return {
						from: vi.fn().mockReturnValue({
							where: vi.fn().mockResolvedValue([
								{ id: "user-1" },
								{ id: "user-2" },
							]),
						}),
					};
				}

				return {
					from: vi.fn().mockReturnValue({
						where: vi.fn().mockResolvedValue(
							selectCall % 2 === 0
								? [{ value: 0 }]
								: [],
						),
					}),
				};
			}),
			insert: vi.fn().mockReturnValue({
				values: vi.fn().mockResolvedValue(undefined),
			}),
		} as never;

		await expect(syncAllUserAchievements(client)).resolves.toEqual({
			userCount: 2,
			awardedCount: 2,
		});
	});
});
