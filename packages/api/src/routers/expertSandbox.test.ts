import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	loggerInfo: vi.fn(),
	loggerError: vi.fn(),
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

import { expertSandboxRouter } from "./expertSandbox";

const scriptId = "123e4567-e89b-12d3-a456-426614174000";
const sessionId = "123e4567-e89b-12d3-a456-426614174001";
const messageId = "123e4567-e89b-12d3-a456-426614174002";

function createCaller(db: unknown, llm = mocks) {
	return expertSandboxRouter.createCaller({
		requestId: "req-1",
		clientIp: "127.0.0.1",
		userAgent: "vitest",
		session: {
			user: {
				id: "expert-1",
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

describe("expertSandboxRouter", () => {
	it("creates a sandbox session", async () => {
		const findFirst = vi.fn().mockResolvedValue({
			context: "Context",
			questions: [{ text: "Tell me about yourself" }],
		});
		const returning = vi.fn().mockResolvedValue([{ id: sessionId }]);
		const insert = vi.fn().mockReturnValue({
			values: vi.fn().mockReturnValue({
				returning,
			}),
		});
		const transaction = vi.fn().mockImplementation(async (callback) =>
			callback({
				insert,
			}),
		);

		await expect(
			createCaller({
				query: {
					scriptsTable: {
						findFirst,
					},
				},
				transaction,
			}).createSession(scriptId),
		).resolves.toBe(sessionId);

		await expect(
			createCaller({
				query: {
					scriptsTable: {
						findFirst: vi.fn().mockResolvedValue(null),
					},
				},
			}).createSession(scriptId),
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
			}).createSession(scriptId),
		).rejects.toMatchObject({ code: "BAD_REQUEST" });

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
			}).createSession(scriptId),
		).rejects.toMatchObject({ code: "BAD_REQUEST" });
	});

	it("returns sandbox session details", async () => {
		const findFirst = vi.fn().mockResolvedValue({
			id: sessionId,
			currentQuestionIndex: 0,
			summarize: "Summary",
			startedAt: new Date("2025-01-01T00:00:00.000Z"),
			script: {
				id: scriptId,
				title: "Frontend",
				description: "Description",
				context: "Context",
				globalCriteria: [],
				questions: [],
			},
			messages: [],
		});

		await expect(
			createCaller({
				query: {
					interviewSessionsTable: {
						findFirst,
					},
				},
			}).getSession(sessionId),
		).resolves.toEqual(
			expect.objectContaining({
				id: sessionId,
				currentQuestionIndex: 0,
			}),
		);

		await expect(
			createCaller({
				query: {
					interviewSessionsTable: {
						findFirst: vi.fn().mockResolvedValue(null),
					},
				},
			}).getSession(sessionId),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("sends an answer and advances to the next question", async () => {
		mocks.summarize.mockResolvedValue("Updated summary");
		mocks.evaluateAnswer.mockResolvedValue({ analysisNote: "Good answer" });
		mocks.planInterviewStep.mockResolvedValue({
			decision: "next_topic",
			question: "",
		});

		const findFirst = vi.fn().mockResolvedValue({
			id: sessionId,
			currentQuestionIndex: 0,
			summarize: null,
			startedAt: new Date("2025-01-01T00:00:00.000Z"),
			script: {
				id: scriptId,
				title: "Frontend",
				description: "Description",
				context: "Context",
				globalCriteria: [],
				questions: [
					{
						text: "Question one",
						specificCriteria: [{ content: "Be concise" }],
					},
					{
						text: "Question two",
						specificCriteria: [{ content: "Give examples" }],
					},
				],
			},
			messages: [
				{
					id: "ai-1",
					isAi: true,
					messageText: "Question one",
					analysisNote: null,
					createdAt: new Date("2025-01-01T01:00:00.000Z"),
				},
			],
			statusLogs: [
				{
					statusId: 1,
					createdAt: new Date("2025-01-01T01:00:00.000Z"),
					status: { name: "active" },
				},
			],
		});
		const transaction = vi.fn().mockImplementation(async (callback) =>
			callback({
				update: vi.fn().mockReturnValue({
					set: vi.fn().mockReturnValue({
						where: vi.fn().mockResolvedValue(undefined),
					}),
				}),
				insert: vi.fn().mockReturnValue({
					values: vi.fn().mockReturnValue({
						returning: vi.fn().mockResolvedValue([
							{
								id: "ai-2",
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
			}).sendAnswer({
				sessionId,
				content: "I have built many interfaces",
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
						findFirst: vi.fn().mockResolvedValue(null),
					},
				},
			}).sendAnswer({
				sessionId,
				content: "I have built many interfaces",
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });

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
			}).sendAnswer({
				sessionId,
				content: "I have built many interfaces",
			}),
		).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
	});

	it("finishes a sandbox session when the planner decides to stop", async () => {
		mocks.summarize.mockResolvedValue("Final summary");
		mocks.evaluateAnswer.mockResolvedValue({
			analysisNote: "Great",
			score: 93,
			feedback: "Well done",
		});
		mocks.planInterviewStep.mockResolvedValue({
			decision: "finish",
			question: "",
		});

		const findFirst = vi.fn().mockResolvedValue({
			id: sessionId,
			currentQuestionIndex: 0,
			summarize: null,
			startedAt: new Date("2025-01-01T00:00:00.000Z"),
			script: {
				id: scriptId,
				title: "Frontend",
				description: "Description",
				context: "Context",
				globalCriteria: [],
				questions: [
					{
						text: "Question one",
						specificCriteria: [],
					},
				],
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
					analysisNote: null,
					createdAt: new Date("2025-01-01T01:10:00.000Z"),
				},
			],
			statusLogs: [
				{
					statusId: 1,
					createdAt: new Date("2025-01-01T01:00:00.000Z"),
					status: { name: "active" },
				},
			],
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
				insert: vi.fn().mockReturnValue({
					values: vi.fn().mockResolvedValue(undefined),
				}),
				update: vi.fn().mockReturnValue({
					set: vi.fn().mockReturnValue({
						where: vi.fn().mockResolvedValue(undefined),
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
			}).sendAnswer({
				sessionId,
				content: "Answer",
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
							id: sessionId,
							currentQuestionIndex: 0,
							summarize: null,
							startedAt: new Date("2025-01-01T00:00:00.000Z"),
							script: {
								id: scriptId,
								title: "Frontend",
								description: "Description",
								context: "Context",
								globalCriteria: [],
								questions: [],
							},
							messages: [],
							statusLogs: [
								{
									statusId: 1,
									createdAt: new Date("2025-01-01T01:00:00.000Z"),
									status: { name: "active" },
								},
							],
						}),
					},
				},
			}).sendAnswer({
				sessionId,
				content: "Answer",
			}),
		).rejects.toMatchObject({ code: "BAD_REQUEST" });
	});

	it("rewinds to a previous message", async () => {
		const findFirst = vi.fn().mockResolvedValue({
			id: sessionId,
			currentQuestionIndex: 1,
			summarize: "Summary",
			startedAt: new Date("2025-01-01T00:00:00.000Z"),
			script: {
				id: scriptId,
				title: "Frontend",
				description: "Description",
				context: "Context",
				globalCriteria: [],
				questions: [
					{
						text: "Question one",
						specificCriteria: [],
					},
				],
			},
			messages: [
				{
					id: messageId,
					isAi: false,
					messageText: "Answer",
					analysisNote: "Note",
					createdAt: new Date("2025-01-01T01:10:00.000Z"),
				},
				{
					id: "ai-2",
					isAi: true,
					messageText: "Question two",
					analysisNote: null,
					createdAt: new Date("2025-01-01T01:20:00.000Z"),
				},
			],
			statusLogs: [
				{
					statusId: 1,
					createdAt: new Date("2025-01-01T01:00:00.000Z"),
					status: { name: "active" },
				},
			],
		});
		const transaction = vi.fn().mockImplementation(async (callback) =>
			callback({
				delete: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue(undefined),
				}),
				update: vi.fn().mockReturnValue({
					set: vi.fn().mockReturnValue({
						where: vi.fn().mockResolvedValue(undefined),
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
			}).rewindSession({
				sessionId,
				messageId,
			}),
		).resolves.toEqual(
			expect.objectContaining({
				messageText: "Answer",
				currentQuestionIndex: 0,
			}),
		);

		await expect(
			createCaller({
				query: {
					interviewSessionsTable: {
						findFirst: vi.fn().mockResolvedValue(null),
					},
				},
			}).rewindSession({
				sessionId,
				messageId,
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });

		await expect(
			createCaller({
				query: {
					interviewSessionsTable: {
						findFirst: vi.fn().mockResolvedValue({
							id: sessionId,
							currentQuestionIndex: 1,
							summarize: "Summary",
							startedAt: new Date("2025-01-01T00:00:00.000Z"),
							script: {
								id: scriptId,
								title: "Frontend",
								description: "Description",
								context: "Context",
								globalCriteria: [],
								questions: [],
							},
							messages: [
								{
									id: "ai-1",
									isAi: true,
									messageText: "Question one",
									analysisNote: null,
									createdAt: new Date("2025-01-01T01:00:00.000Z"),
								},
							],
							statusLogs: [
								{
									statusId: 1,
									createdAt: new Date("2025-01-01T01:00:00.000Z"),
									status: { name: "active" },
								},
							],
						}),
					},
				},
			}).rewindSession({
				sessionId,
				messageId,
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });

		await expect(
			createCaller({
				query: {
					interviewSessionsTable: {
						findFirst: vi.fn().mockResolvedValue({
							id: sessionId,
							currentQuestionIndex: 1,
							summarize: "Summary",
							startedAt: new Date("2025-01-01T00:00:00.000Z"),
							script: {
								id: scriptId,
								title: "Frontend",
								description: "Description",
								context: "Context",
								globalCriteria: [],
								questions: [],
							},
							messages: [
								{
									id: messageId,
									isAi: true,
									messageText: "Question one",
									analysisNote: null,
									createdAt: new Date("2025-01-01T01:00:00.000Z"),
								},
							],
							statusLogs: [
								{
									statusId: 1,
									createdAt: new Date("2025-01-01T01:00:00.000Z"),
									status: { name: "active" },
								},
							],
						}),
					},
				},
			}).rewindSession({
				sessionId,
				messageId,
			}),
		).rejects.toMatchObject({ code: "BAD_REQUEST" });
	});
});
