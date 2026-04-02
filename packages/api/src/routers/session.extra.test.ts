import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	loggerInfo: vi.fn(),
	loggerError: vi.fn(),
	syncUserAchievements: vi.fn().mockResolvedValue(undefined),
	calculateInterviewExperience: vi.fn().mockReturnValue(12),
	summarize: vi.fn(),
	evaluateAnswer: vi.fn(),
	planInterviewStep: vi.fn(),
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

vi.mock("../achievements/metrics", () => ({
	syncUserAchievements: mocks.syncUserAchievements,
}));

vi.mock("./sessionExperience", () => ({
	calculateInterviewExperience: mocks.calculateInterviewExperience,
}));

import { statusToId } from "@diplom_work/domain/values/sessionStatus";
import { sessionRouter } from "./session";

const scriptId = "123e4567-e89b-12d3-a456-426614174000";
const sessionId = "123e4567-e89b-12d3-a456-426614174001";

function createCaller(db: unknown, llm = mocks) {
	return sessionRouter.createCaller({
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
		llm: {
			summarize: llm.summarize,
			evaluateAnswer: llm.evaluateAnswer,
			planInterviewStep: llm.planInterviewStep,
		},
	} as never);
}

describe("sessionRouter extra coverage", () => {
	it("creates a new interview session", async () => {
		const scriptsFindFirst = vi.fn().mockResolvedValue({
			context: "System context",
			questions: [
				{
					text: "Tell me about yourself",
				},
			],
		});
		const insertSessionReturning = vi.fn().mockResolvedValue([
			{
				id: sessionId,
			},
		]);
		const transaction = vi.fn().mockImplementation(async (callback) =>
			callback({
				insert: vi.fn().mockImplementation((table: unknown) => {
					if (table) {
						return {
							values: vi.fn().mockReturnValue({
								returning: insertSessionReturning,
							}),
						};
					}
					return undefined;
				}),
			}),
		);

		await expect(
			createCaller({
				query: {
					scriptsTable: {
						findFirst: scriptsFindFirst,
					},
				},
				transaction,
			}).createNewSession(scriptId),
		).resolves.toBe(sessionId);
	});

	it("rejects missing scripts, empty contexts and empty question lists", async () => {
		await expect(
			createCaller({
				query: {
					scriptsTable: {
						findFirst: vi.fn().mockResolvedValue(null),
					},
				},
			}).createNewSession(scriptId),
		).rejects.toMatchObject({ code: "NOT_FOUND" });

		await expect(
			createCaller({
				query: {
					scriptsTable: {
						findFirst: vi.fn().mockResolvedValue({
							context: null,
							questions: [{ text: "Question" }],
						}),
					},
				},
			}).createNewSession(scriptId),
		).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });

		await expect(
			createCaller({
				query: {
					scriptsTable: {
						findFirst: vi.fn().mockResolvedValue({
							context: "Context",
							questions: [],
						}),
					},
				},
			}).createNewSession(scriptId),
		).rejects.toMatchObject({ code: "BAD_REQUEST" });
	});

	it("returns the interview result for a finished session", async () => {
		const findFirst = vi.fn().mockResolvedValue({
			id: sessionId,
			finalScore: 88,
			expertFeedback: "Great",
			startedAt: new Date("2025-01-01T00:00:00.000Z"),
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
				id: scriptId,
				title: "Frontend",
				description: "Description",
			},
			messages: [
				{
					id: "ai-1",
					isAi: true,
					messageText: "Question one",
					analysisNote: null,
					createdAt: new Date("2025-01-01T01:00:00.000Z"),
				},
				{
					id: "human-1",
					isAi: false,
					messageText: "Answer",
					analysisNote: "Nice",
					createdAt: new Date("2025-01-01T01:10:00.000Z"),
				},
			],
		});

		await expect(
			createCaller({
				query: {
					interviewSessionsTable: {
						findFirst,
					},
				},
			}).getResultBySessionId(sessionId),
		).resolves.toEqual(
			expect.objectContaining({
				id: sessionId,
				finishedAt: new Date("2025-01-01T02:00:00.000Z"),
				experienceGained: 12,
			}),
		);

		await expect(
			createCaller({
				query: {
					interviewSessionsTable: {
						findFirst: vi.fn().mockResolvedValue(null),
					},
				},
			}).getResultBySessionId(sessionId),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("returns the session script by interview id and rejects missing sessions", async () => {
		const findFirst = vi.fn().mockResolvedValue({
			script: {
				id: scriptId,
				title: "Frontend",
			},
		});

		await expect(
			createCaller({
				query: {
					interviewSessionsTable: {
						findFirst,
					},
				},
			}).getScriptByInterviewId(sessionId),
		).resolves.toEqual({
			id: scriptId,
			title: "Frontend",
		});

		await expect(
			createCaller({
				query: {
					interviewSessionsTable: {
						findFirst: vi.fn().mockResolvedValue(null),
					},
				},
			}).getScriptByInterviewId(sessionId),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("returns the chat history for a session", async () => {
		const select = vi.fn().mockReturnValue({
			from: vi.fn().mockReturnValue({
				innerJoin: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([
						{
							id: "message-1",
							messageText: "Question one",
							isAi: true,
							analysisNote: null,
							createdAt: new Date("2025-01-01T01:00:00.000Z"),
							sessionId,
						},
					]),
				}),
			}),
		});

		await expect(
			createCaller({
				select,
			}).getAllHistory(sessionId),
		).resolves.toEqual([
			{
				id: "message-1",
				messageText: "Question one",
				isAi: true,
				analysisNote: null,
				createdAt: new Date("2025-01-01T01:00:00.000Z"),
				sessionId,
			},
		]);
	});

	it("adds a new answer and generates a follow-up question", async () => {
		mocks.summarize.mockResolvedValue("Summary");
		mocks.evaluateAnswer.mockResolvedValue({ analysisNote: "Nice answer" });
		mocks.planInterviewStep.mockResolvedValue({
			decision: "next_topic",
			question: "",
		});

		const findFirst = vi.fn().mockResolvedValue({
			currentQuestionIndex: 0,
			summarize: null,
			statusLogs: [
				{
					statusId: statusToId.active,
					createdAt: new Date("2025-01-01T01:00:00.000Z"),
					status: {
						name: "active",
					},
				},
			],
			messages: [
				{
					isAi: true,
					messageText: "Question one",
				},
			],
			script: {
				context: "Context",
				globalCriteria: [
					{
						content: "Be concise",
						type: {
							name: "general",
						},
					},
				],
				questions: [
					{
						text: "Question one",
						specificCriteria: [{ content: "Criterion" }],
					},
					{
						text: "Question two",
						specificCriteria: [{ content: "Next criterion" }],
					},
				],
			},
		});
		const transaction = vi.fn().mockImplementation(async (callback) =>
			callback({
				query: {
					interviewSessionsTable: {
						findFirst,
					},
				},
				update: vi.fn().mockReturnValue({
					set: vi.fn().mockReturnValue({
						where: vi.fn().mockResolvedValue(undefined),
					}),
				}),
				insert: vi.fn().mockReturnValue({
					values: vi.fn().mockReturnValue({
						returning: vi.fn().mockResolvedValue([
							{
								id: "message-2",
								isAi: true,
								messageText: "Question two",
								createdAt: new Date("2025-01-01T02:00:00.000Z"),
							},
						]),
					}),
				}),
			}),
		);

		await expect(
			createCaller({
				query: {
					interviewSessionsTable: {
						findFirst,
					},
				},
				transaction,
			}).addNewMessage({
				sessionId,
				content: "I am a frontend engineer",
			}),
		).resolves.toEqual(
			expect.objectContaining({
				type: "next-question",
			}),
		);

		await expect(
			createCaller({
				query: {
					interviewSessionsTable: {
						findFirst: vi.fn().mockResolvedValue({
							currentQuestionIndex: 0,
							summarize: null,
							statusLogs: [
								{
									statusId: statusToId.canceled,
									createdAt: new Date("2025-01-01T01:00:00.000Z"),
									status: {
										name: "canceled",
									},
								},
							],
							messages: [
								{
									isAi: true,
									messageText: "Question one",
								},
							],
							script: {
								context: "Context",
								globalCriteria: [],
								questions: [
									{
										text: "Question one",
										specificCriteria: [],
									},
								],
							},
						}),
					},
				},
			}).addNewMessage({
				sessionId,
				content: "I am a frontend engineer",
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("finishes a session when the planner decides to stop", async () => {
		mocks.summarize.mockResolvedValue("Summary");
		mocks.evaluateAnswer.mockResolvedValue({ analysisNote: "Nice answer", score: 91, feedback: "Great" });
		mocks.planInterviewStep.mockResolvedValue({
			decision: "finish",
			question: "",
		});

		const findFirst = vi.fn().mockResolvedValue({
			currentQuestionIndex: 0,
			summarize: null,
			statusLogs: [
				{
					statusId: statusToId.active,
					createdAt: new Date("2025-01-01T01:00:00.000Z"),
					status: {
						name: "active",
					},
				},
			],
			messages: [
				{
					isAi: true,
					messageText: "Question one",
				},
			],
			script: {
				context: "Context",
				globalCriteria: [],
				questions: [
					{
						text: "Question one",
						specificCriteria: [],
					},
				],
			},
		});
		const transaction = vi.fn().mockImplementation(async (callback) =>
			callback({
				query: {
					interviewSessionsTable: {
						findFirst,
					},
					usersTable: {
						findFirst: vi.fn().mockResolvedValue({ id: "user-1" }),
					},
				},
				update: vi.fn().mockReturnValue({
					set: vi.fn().mockReturnValue({
						where: vi.fn().mockResolvedValue(undefined),
					}),
				}),
				insert: vi.fn().mockReturnValue({
					values: vi.fn().mockResolvedValue(undefined),
				}),
			}),
		);

		await expect(
			createCaller({
				query: {
					interviewSessionsTable: {
						findFirst,
					},
				},
				transaction,
			}).addNewMessage({
				sessionId,
				content: "I am a frontend engineer",
			}),
		).resolves.toEqual(
			expect.objectContaining({
				type: "finished",
			}),
		);

		await expect(
			createCaller({
				query: {
					interviewSessionsTable: {
						findFirst: vi.fn().mockResolvedValue({
							currentQuestionIndex: 1,
							summarize: null,
							statusLogs: [
								{
									statusId: statusToId.active,
									createdAt: new Date("2025-01-01T01:00:00.000Z"),
									status: {
										name: "active",
									},
								},
							],
							messages: [],
							script: {
								context: "Context",
								globalCriteria: [],
								questions: [
									{
										text: "Question one",
										specificCriteria: [],
									},
								],
							},
						}),
					},
				},
			}).addNewMessage({
				sessionId,
				content: "I am a frontend engineer",
			}),
		).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });

		await expect(
			createCaller({
				query: {
					interviewSessionsTable: {
						findFirst: vi.fn().mockResolvedValue({
							currentQuestionIndex: 0,
							summarize: null,
							statusLogs: [
								{
									statusId: statusToId.active,
									createdAt: new Date("2025-01-01T01:00:00.000Z"),
									status: {
										name: "active",
									},
								},
							],
							messages: [
								{
									isAi: true,
									messageText: "Question one",
								},
							],
							script: {
								context: "Context",
								globalCriteria: [],
								questions: [],
							},
						}),
					},
				},
			}).addNewMessage({
				sessionId,
				content: "I am a frontend engineer",
			}),
		).rejects.toMatchObject({ code: "BAD_REQUEST" });
	});

	it("handles already finished sessions when explicitly finishing or canceling", async () => {
		const terminalFindFirst = vi.fn().mockResolvedValue({
			id: sessionId,
			summarize: null,
			statusLogs: [
				{
					statusId: statusToId.complete,
					createdAt: new Date("2025-01-01T02:00:00.000Z"),
					status: {
						name: "complete",
					},
				},
			],
		});
		const transaction = vi.fn().mockImplementation(async (callback) =>
			callback({
				query: {
					interviewSessionsTable: {
						findFirst: terminalFindFirst,
					},
					usersTable: {
						findFirst: vi.fn().mockResolvedValue({ id: "user-1" }),
					},
				},
				update: vi.fn().mockReturnValue({
					set: vi.fn().mockReturnValue({
						where: vi.fn().mockResolvedValue(undefined),
					}),
				}),
				insert: vi.fn().mockReturnValue({
					values: vi.fn().mockResolvedValue(undefined),
				}),
			}),
		);

		await expect(
			createCaller({
				query: {
					interviewSessionsTable: {
						findFirst: terminalFindFirst,
					},
				},
				transaction,
			}).finishSession(sessionId),
		).resolves.toEqual({
			complete: false,
			streakUpdated: false,
			experienceGained: 0,
		});

		await expect(
			createCaller({
				query: {
					interviewSessionsTable: {
						findFirst: terminalFindFirst,
					},
				},
				transaction,
			}).cancelSession(sessionId),
		).resolves.toEqual({
			canceled: false,
		});

		const activeTransaction = vi.fn().mockImplementation(async (callback) =>
			callback({
				query: {
					interviewSessionsTable: {
						findFirst: vi.fn().mockResolvedValue({
							id: sessionId,
							summarize: null,
							statusLogs: [
								{
									statusId: statusToId.active,
									createdAt: new Date("2025-01-01T02:00:00.000Z"),
									status: {
										name: "active",
									},
								},
							],
							messages: [
								{
									isAi: true,
									messageText: "Question one",
								},
								{
									isAi: false,
									messageText: "Answer",
								},
							],
							script: {
								context: "Context",
								globalCriteria: [],
								questions: [
									{
										text: "Question one",
										specificCriteria: [],
									},
								],
							},
						}),
					},
				},
				update: vi.fn().mockReturnValue({
					set: vi.fn().mockReturnValue({
						where: vi.fn().mockResolvedValue(undefined),
					}),
				}),
				insert: vi.fn().mockReturnValue({
					values: vi.fn().mockResolvedValue(undefined),
				}),
			}),
		);

		await expect(
			createCaller({
				query: {
					interviewSessionsTable: {
						findFirst: terminalFindFirst,
					},
				},
				transaction: activeTransaction,
			}).cancelSession(sessionId),
		).resolves.toEqual({
			canceled: true,
		});
	});
});
