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

import { reportRouter } from "./report";

function createCaller(
	db: unknown,
	role: "admin" | "expert" = "expert",
	userId = "user-1",
) {
	return reportRouter.createCaller({
		requestId: "req-1",
		clientIp: "127.0.0.1",
		userAgent: "vitest",
		session: {
			user: {
				id: userId,
			},
			session: {
				role,
			},
		},
		setCookieHeaders: [],
		auth: {} as never,
		db,
		file: {} as never,
		llm: {} as never,
	} as never);
}

describe("reportRouter", () => {
	it("returns an existing active report instead of creating a duplicate", async () => {
		const findFirst = vi
			.fn()
			.mockResolvedValueOnce({
				id: "report-1",
				statusLogs: [
					{
						status: "new",
						createdAt: new Date("2025-01-01T00:00:00.000Z"),
					},
				],
			})
			.mockResolvedValueOnce(null);

		const caller = createCaller({
			query: {
				reportsTable: {
					findFirst,
				},
				scriptsTable: {
					findFirst: vi.fn(),
				},
			},
		});

		await expect(
			caller.create({
				scriptId: "123e4567-e89b-12d3-a456-426614174000",
				reason: "The scenario is not safe enough",
			}),
		).resolves.toEqual({ id: "report-1" });
	});

	it("rejects reports for missing scripts", async () => {
		const findFirst = vi.fn().mockResolvedValueOnce(null);
		const caller = createCaller({
			query: {
				reportsTable: {
					findFirst,
				},
				scriptsTable: {
					findFirst,
				},
			},
		});

		await expect(
			caller.create({
				scriptId: "123e4567-e89b-12d3-a456-426614174000",
				reason: "The scenario is not safe enough",
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("creates a new report and initial status log", async () => {
		const reporter = {
			id: "user-1",
			name: "Alex",
			email: "alex@example.com",
		};
		const script = {
			id: "script-1",
			expertId: "expert-1",
		};
		const insertReturning = vi.fn().mockResolvedValue([{ id: "report-1" }]);
		const insertValues = vi
			.fn()
			.mockReturnValueOnce({ returning: insertReturning })
			.mockReturnValueOnce({ values: vi.fn().mockResolvedValue(undefined) });
		const insert = vi.fn().mockReturnValue({
			values: insertValues,
		});
		const findFirst = vi
			.fn()
			.mockResolvedValueOnce(null)
			.mockResolvedValueOnce(script);

		await expect(
			createCaller({
				query: {
					reportsTable: {
						findFirst,
					},
					scriptsTable: {
						findFirst,
					},
				},
				insert,
			}).create({
				scriptId: script.id,
				reason: "The scenario is not safe enough for learners",
			}),
		).resolves.toEqual({ id: "report-1" });
		expect(insert).toHaveBeenCalledTimes(2);
		expect(mocks.loggerInfo).toHaveBeenCalledWith(
			expect.objectContaining({
				reportId: "report-1",
				scriptId: script.id,
				reporterId: "user-1",
			}),
			"Created report",
		);

		await expect(
			createCaller({
				query: {
					reportsTable: {
						findFirst: vi.fn().mockResolvedValueOnce(null),
					},
					scriptsTable: {
						findFirst: vi.fn().mockResolvedValueOnce(script),
					},
				},
				insert: vi.fn().mockReturnValue({
					values: vi.fn().mockReturnValue({
						returning: vi.fn().mockResolvedValue([]),
					}),
				}),
			}).create({
				scriptId: script.id,
				reason: "The scenario is not safe enough for learners",
			}),
		).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
	});

	it("lists the current user's reports", async () => {
		const findMany = vi.fn().mockResolvedValue([
			{
				id: "report-1",
				reason: "Reason",
				createdAt: new Date("2025-01-01T00:00:00.000Z"),
				reporter: {
					id: "user-1",
					name: "Alex",
					email: "alex@example.com",
				},
				scenario: {
					id: "script-1",
					title: "Frontend",
					category: {
						id: 10,
						name: "Frontend",
					},
					expert: {
						id: "expert-1",
						name: "Expert",
					},
				},
				statusLogs: [
					{
						status: "in_review",
						createdAt: new Date("2025-01-02T00:00:00.000Z"),
					},
				],
			},
		]);

		await expect(
			createCaller({
				query: {
					reportsTable: {
						findMany,
					},
				},
			}).myList(),
		).resolves.toEqual([
			{
				id: "report-1",
				reason: "Reason",
				createdAt: new Date("2025-01-01T00:00:00.000Z"),
				status: "in_review",
				reporter: {
					id: "user-1",
					name: "Alex",
					email: "alex@example.com",
				},
				scenario: {
					id: "script-1",
					title: "Frontend",
					category: {
						id: 10,
						name: "Frontend",
					},
					expert: {
						id: "expert-1",
						name: "Expert",
					},
				},
				statusUpdatedAt: new Date("2025-01-02T00:00:00.000Z"),
			},
		]);
	});

	it("filters admin reports by status", async () => {
		const scriptIds = vi.fn().mockResolvedValue([{ id: "script-1" }]);
		const reports = vi.fn().mockResolvedValue([
			{
				id: "report-1",
				reason: "Reason",
				createdAt: new Date("2025-01-01T00:00:00.000Z"),
				reporter: {
					id: "user-1",
					name: "Alex",
					email: "alex@example.com",
				},
				scenario: null,
				statusLogs: [],
			},
		]);
		const select = vi.fn().mockReturnValue({
			from: vi.fn().mockReturnValue({
				leftJoin: vi.fn().mockReturnValue({
					where: scriptIds,
				}),
			}),
		});

		await expect(
			createCaller(
				{
					select,
					query: {
						reportsTable: {
							findMany: reports,
						},
					},
				},
				"admin",
			).adminList({
				status: "new",
				search: "Frontend",
			}),
		).resolves.toEqual([
			{
				id: "report-1",
				reason: "Reason",
				createdAt: new Date("2025-01-01T00:00:00.000Z"),
				status: "new",
				reporter: {
					id: "user-1",
					name: "Alex",
					email: "alex@example.com",
				},
				scenario: null,
				statusUpdatedAt: new Date("2025-01-01T00:00:00.000Z"),
			},
		]);
	});

	it("returns an empty expert report list when no scripts match", async () => {
		const select = vi.fn().mockReturnValue({
			from: vi.fn().mockReturnValue({
				leftJoin: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([]),
				}),
			}),
		});

		await expect(
			createCaller(
				{
					select,
					query: {
						reportsTable: {
							findMany: vi.fn(),
						},
					},
				},
				"expert",
				"expert-1",
			).expertList({
				search: "Frontend",
			}),
		).resolves.toEqual([]);
	});

	it("returns report details for the owner and rejects strangers", async () => {
		const report = {
			id: "report-1",
			reason: "Reason",
			createdAt: new Date("2025-01-01T00:00:00.000Z"),
			reporter: {
				id: "user-1",
				name: "Alex",
				email: "alex@example.com",
			},
			scenario: {
				id: "script-1",
				title: "Frontend",
				category: {
					id: 10,
					name: "Frontend",
				},
				expert: {
					id: "expert-1",
					name: "Expert",
				},
			},
			statusLogs: [
				{
					status: "new",
					createdAt: new Date("2025-01-02T00:00:00.000Z"),
				},
			],
		};
		const findFirst = vi.fn().mockResolvedValue(report);

		await expect(
			createCaller(
				{
					query: {
						reportsTable: {
							findFirst,
						},
					},
				},
				"expert",
				"user-1",
			).getById("report-1"),
		).resolves.toEqual(
			expect.objectContaining({
				id: "report-1",
				status: "new",
			}),
		);

		await expect(
			createCaller(
				{
					query: {
						reportsTable: {
							findFirst,
						},
					},
				},
				"expert",
				"user-2",
			).getById("report-1"),
		).rejects.toMatchObject({ code: "FORBIDDEN" });

		await expect(
			createCaller(
				{
					query: {
						reportsTable: {
							findFirst: vi.fn().mockResolvedValue(null),
						},
					},
				},
				"expert",
				"user-1",
			).getById("report-1"),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("changes report status", async () => {
		const findFirst = vi.fn().mockResolvedValue({ id: "report-1" });
		const insertValues = vi.fn().mockResolvedValue(undefined);
		const insert = vi.fn().mockReturnValue({
			values: insertValues,
		});

		await expect(
			createCaller(
				{
					query: {
						reportsTable: {
							findFirst,
						},
					},
					insert,
				},
				"admin",
			).changeStatus({
				reportId: "report-1",
				status: "resolved",
			}),
		).resolves.toEqual({
			id: "report-1",
			status: "resolved",
		});
		expect(insertValues).toHaveBeenCalledWith(
			expect.objectContaining({
				reportId: "report-1",
				status: "resolved",
				createdAt: expect.any(Date),
			}),
		);

		await expect(
			createCaller(
				{
					query: {
						reportsTable: {
							findFirst: vi.fn().mockResolvedValue(null),
						},
					},
				},
				"admin",
			).changeStatus({
				reportId: "report-1",
				status: "resolved",
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});
});
