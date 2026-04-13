import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	loggerInfo: vi.fn(),
	loggerError: vi.fn(),
	getPersistentLink: vi.fn(),
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

import { statusToId } from "@diplom_work/domain/values/sessionStatus";
import { scriptRouter } from "./script";

const scriptUuid = "123e4567-e89b-12d3-a456-426614174000";
const expertUuid = "123e4567-e89b-12d3-a456-426614174001";

function createCaller(db: unknown, file: unknown = {}) {
	return scriptRouter.createCaller({
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
		file,
		llm: {} as never,
	} as never);
}

describe("scriptRouter", () => {
	it("returns a script by id", async () => {
		const findFirst = vi.fn().mockResolvedValue({
			id: scriptUuid,
			title: "Frontend",
			description: "Build a UI",
			draftOverAt: null,
			image: null,
			expert: {
				id: "expert-1",
			},
			category: {
				id: 10,
				name: "Frontend",
			},
		});

		await expect(
			createCaller({
				query: {
					scriptsTable: {
						findFirst,
					},
				},
			}).getInfo(scriptUuid),
		).resolves.toEqual(
			expect.objectContaining({
				id: scriptUuid,
				title: "Frontend",
			}),
		);

		await expect(
			createCaller({
				query: {
					scriptsTable: {
						findFirst: vi.fn().mockResolvedValue(null),
					},
				},
			}).getInfo(scriptUuid),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("resolves latest scripts and rewrites image links", async () => {
		mocks.getPersistentLink.mockResolvedValue("https://cdn.test/image.png");
		const limit = vi.fn().mockResolvedValue([
			{
				id: scriptUuid,
				title: "Frontend",
				description: "Build a UI",
				image: "avatars/image.png",
				categoryName: "Frontend",
				expertId: expertUuid,
				expertName: "Alex",
			},
			{
				id: "123e4567-e89b-12d3-a456-426614174010",
				title: "Backend",
				description: "Build an API",
				image: null,
				categoryName: "Backend",
				expertId: "123e4567-e89b-12d3-a456-426614174011",
				expertName: "Sam",
			},
			]);
			const offset = vi.fn();
			const where = vi.fn().mockReturnValue({
				orderBy: vi.fn().mockReturnValue({
					limit,
				}),
			});
			const innerJoin = vi.fn().mockReturnValue({
				innerJoin: vi.fn().mockReturnValue({
					where,
				}),
			});
			const from = vi.fn().mockReturnValue({
				innerJoin,
			});
		const select = vi.fn().mockReturnValue({
			from,
		});

		await expect(
			createCaller(
				{
					select,
				},
				{
					getPersistentLink: mocks.getPersistentLink,
				},
			).getLatest({
				limit: 2,
			}),
			).resolves.toEqual([
				{
					id: scriptUuid,
					title: "Frontend",
				description: "Build a UI",
				image: "https://cdn.test/image.png",
				categoryName: "Frontend",
				expertId: expertUuid,
				expertName: "Alex",
			},
			{
				id: "123e4567-e89b-12d3-a456-426614174010",
				title: "Backend",
				description: "Build an API",
				image: null,
				categoryName: "Backend",
				expertId: "123e4567-e89b-12d3-a456-426614174011",
				expertName: "Sam",
			},
		]);
		expect(mocks.getPersistentLink).toHaveBeenCalledWith("avatars/image.png");
		expect(offset).not.toHaveBeenCalled();
	});

	it("lists categories and criteria types", async () => {
		const categoriesSelect = vi.fn().mockReturnValue({
			from: vi.fn().mockResolvedValue([{ id: 1, name: "Frontend" }]),
		});
		const criteriaSelect = vi.fn().mockReturnValue({
			from: vi.fn().mockResolvedValue([{ id: 2, name: "Accuracy" }]),
		});

		const caller = createCaller({
			select: vi
				.fn()
				.mockImplementationOnce(() => categoriesSelect())
				.mockImplementationOnce(() => criteriaSelect()),
		});

		await expect(caller.categories()).resolves.toEqual([
			{ id: 1, name: "Frontend" },
		]);
		await expect(caller.criteriaTypes()).resolves.toEqual([
			{ id: 2, name: "Accuracy" },
		]);
	});

	it("lists scenarios with pagination and filters", async () => {
		const totalWhere = vi.fn().mockResolvedValue([{ count: 3 }]);
		const courseWhere = vi.fn().mockResolvedValue([
			{
				id: scriptUuid,
				title: "Frontend",
				description: "Build a UI",
				image: null,
				categoryName: "Frontend",
				expertId: expertUuid,
				expertName: "Alex",
			},
		]);
			const totalSelect = vi.fn().mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: totalWhere,
				}),
			});
			const courseSelect = vi.fn().mockReturnValue({
				from: vi.fn().mockReturnValue({
					innerJoin: vi.fn().mockReturnValue({
						innerJoin: vi.fn().mockReturnValue({
							where: vi.fn().mockReturnValue({
								orderBy: vi.fn().mockReturnValue({
									limit: vi.fn().mockReturnValue({
										offset: courseWhere,
									}),
								}),
							}),
						}),
					}),
				}),
			});
		const select = vi
			.fn()
			.mockImplementationOnce(() => totalSelect())
			.mockImplementationOnce(() => courseSelect());

		await expect(
			createCaller({
				select,
			}).list({
				page: 2,
				limit: 1,
				categoryId: 5,
				search: "frontend",
			}),
		).resolves.toEqual({
				courses: [
					{
						id: scriptUuid,
						title: "Frontend",
						description: "Build a UI",
						image: null,
						categoryName: "Frontend",
						expertId: expertUuid,
						expertName: "Alex",
					},
				],
			total: 3,
			page: 2,
			pages: 3,
		});
	});

	it("returns an expert profile with optional category filtering", async () => {
		const expertFindFirst = vi.fn().mockResolvedValue({
			id: expertUuid,
			name: "Alex",
			image: "avatar.png",
		});
		const categoriesSelect = vi.fn().mockReturnValue({
			from: vi.fn().mockReturnValue({
				innerJoin: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						groupBy: vi.fn().mockReturnValue({
							orderBy: vi
								.fn()
								.mockResolvedValue([{ id: 10, name: "Frontend", count: 2 }]),
						}),
					}),
				}),
			}),
		});
		const coursesSelect = vi.fn().mockReturnValue({
			from: vi.fn().mockReturnValue({
				innerJoin: vi.fn().mockReturnValue({
					innerJoin: vi.fn().mockReturnValue({
						where: vi.fn().mockReturnValue({
							orderBy: vi.fn().mockResolvedValue([
								{
									id: scriptUuid,
									title: "Frontend",
									description: "Build a UI",
									image: null,
									categoryId: 10,
									categoryName: "Frontend",
									expertId: expertUuid,
									expertName: "Alex",
								},
							]),
						}),
					}),
				}),
			}),
		});
		const select = vi
			.fn()
			.mockImplementationOnce(() => categoriesSelect())
			.mockImplementationOnce(() => coursesSelect());

		await expect(
			createCaller({
				query: {
					usersTable: {
						findFirst: expertFindFirst,
					},
				},
				select,
			}).getExpertProfile({
				expertId: expertUuid,
				categoryId: 10,
			}),
		).resolves.toEqual({
			expert: {
				id: expertUuid,
				name: "Alex",
				image: "avatar.png",
			},
			categories: [{ id: 10, name: "Frontend", count: 2 }],
			courses: [
					{
						id: scriptUuid,
						title: "Frontend",
						description: "Build a UI",
						image: null,
						categoryId: 10,
						categoryName: "Frontend",
						expertId: expertUuid,
						expertName: "Alex",
					},
				],
			});

		await expect(
			createCaller({
				query: {
					usersTable: {
						findFirst: vi.fn().mockResolvedValue(null),
					},
				},
				select: vi.fn(),
			}).getExpertProfile({
				expertId: expertUuid,
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("maps user history entries to finished timestamps", async () => {
		const findMany = vi.fn().mockResolvedValue([
			{
				id: "session-1",
				startedAt: new Date("2025-01-01T00:00:00.000Z"),
				finalScore: 82,
				expertFeedback: "Great",
				statusLogs: [
					{
						statusId: statusToId.complete,
						createdAt: new Date("2025-01-01T02:00:00.000Z"),
						status: {
							name: "complete",
						},
					},
				],
				script: {
					id: "script-1",
					title: "Frontend",
					description: "Build a UI",
				},
			},
			{
				id: "session-2",
				startedAt: new Date("2025-01-02T00:00:00.000Z"),
				finalScore: null,
				expertFeedback: null,
				statusLogs: [
					{
						statusId: statusToId.active,
						createdAt: new Date("2025-01-02T02:00:00.000Z"),
						status: {
							name: "active",
						},
					},
				],
				script: {
					id: "script-2",
					title: "Backend",
					description: "Build an API",
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
			}).getUserHistory(),
		).resolves.toEqual([
			{
				id: "session-1",
				startedAt: new Date("2025-01-01T00:00:00.000Z"),
				finalScore: 82,
				expertFeedback: "Great",
				script: {
					id: "script-1",
					title: "Frontend",
					description: "Build a UI",
				},
				finishedAt: new Date("2025-01-01T02:00:00.000Z"),
				status: {
					name: "complete",
				},
			},
			{
				id: "session-2",
				startedAt: new Date("2025-01-02T00:00:00.000Z"),
				finalScore: null,
				expertFeedback: null,
				script: {
					id: "script-2",
					title: "Backend",
					description: "Build an API",
				},
				finishedAt: null,
				status: {
					name: "active",
				},
			},
		]);
	});

	it("returns user history by script id", async () => {
		const findMany = vi.fn().mockResolvedValue([
			{
				id: "session-1",
				startedAt: new Date("2025-01-03T00:00:00.000Z"),
				finalScore: 90,
				expertFeedback: "Nice",
				statusLogs: [
					{
						statusId: statusToId.canceled,
						createdAt: new Date("2025-01-03T02:00:00.000Z"),
						status: {
							name: "canceled",
						},
					},
				],
				script: {
					id: "script-1",
					title: "Frontend",
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
			}).getUserHistoryByScript(scriptUuid),
		).resolves.toEqual([
			{
				id: "session-1",
				startedAt: new Date("2025-01-03T00:00:00.000Z"),
				finalScore: 90,
				expertFeedback: "Nice",
				statusLogs: [
					{
						statusId: statusToId.canceled,
						createdAt: new Date("2025-01-03T02:00:00.000Z"),
						status: {
							name: "canceled",
						},
					},
				],
				script: {
					id: "script-1",
					title: "Frontend",
				},
				finishedAt: new Date("2025-01-03T02:00:00.000Z"),
				status: {
					name: "canceled",
				},
			},
		]);
	});
});
