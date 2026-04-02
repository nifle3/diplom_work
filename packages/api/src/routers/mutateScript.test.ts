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

import { mutateScriptRouter } from "./mutateScript";

const scriptId = "123e4567-e89b-12d3-a456-426614174000";

function createCaller(db: unknown) {
	return mutateScriptRouter.createCaller({
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
		llm: {} as never,
	} as never);
}

describe("mutateScriptRouter", () => {
	it("publishes a filled draft", async () => {
		const findFirst = vi.fn().mockResolvedValue({
			id: scriptId,
			expertId: "expert-1",
			context: "Context",
			categoryId: 10,
			title: "Script title",
			isDraft: true,
		});
		const where = vi.fn().mockResolvedValue(undefined);
		const set = vi.fn().mockReturnValue({
			where,
		});
		const update = vi.fn().mockReturnValue({
			set,
		});

		await expect(
			createCaller({
				query: {
					scriptsTable: {
						findFirst,
					},
				},
				update,
			}).postDraft(scriptId),
		).resolves.toBeUndefined();
		expect(update).toHaveBeenCalledTimes(1);
		expect(mocks.loggerInfo).toHaveBeenCalledWith(
			{ scriptId, expertId: "expert-1" },
			"Published script draft",
		);

		await expect(
			createCaller({
				query: {
					scriptsTable: {
						findFirst: vi.fn().mockResolvedValue({
							id: scriptId,
							expertId: "someone-else",
							context: "Context",
							categoryId: 10,
							title: "Script title",
							isDraft: true,
						}),
					},
				},
			}).postDraft(scriptId),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("rejects draft publication when the script is missing or incomplete", async () => {
		const missingCaller = createCaller({
			query: {
				scriptsTable: {
					findFirst: vi.fn().mockResolvedValue(null),
				},
			},
		});

		await expect(missingCaller.postDraft(scriptId)).rejects.toMatchObject({
			code: "NOT_FOUND",
		});

		const invalidCaller = createCaller({
			query: {
				scriptsTable: {
					findFirst: vi.fn().mockResolvedValue({
						id: scriptId,
						expertId: "expert-1",
						context: null,
						categoryId: null,
						title: null,
						isDraft: true,
					}),
				},
			},
		});

		await expect(invalidCaller.postDraft(scriptId)).rejects.toMatchObject({
			code: "BAD_REQUEST",
		});
	});

	it("deletes a script", async () => {
		const findFirst = vi.fn().mockResolvedValue({
			id: scriptId,
			expertId: "expert-1",
		});
		const where = vi.fn().mockResolvedValue([{ id: scriptId }]);
		const set = vi.fn().mockReturnValue({
			where,
		});
		const update = vi.fn().mockReturnValue({
			set,
		});

		await expect(
			createCaller({
				query: {
					scriptsTable: {
						findFirst,
					},
				},
				update,
			}).deleteScript(scriptId),
		).resolves.toBeUndefined();
		expect(mocks.loggerInfo).toHaveBeenCalledWith(
			{ scriptId, expertId: "expert-1" },
			"Deleted script",
		);

		await expect(
			createCaller({
				query: {
					scriptsTable: {
						findFirst: vi.fn().mockResolvedValue(null),
					},
				},
			}).deleteScript(scriptId),
		).rejects.toMatchObject({ code: "NOT_FOUND" });

		await expect(
			createCaller({
				query: {
					scriptsTable: {
						findFirst: vi.fn().mockResolvedValue({
							id: scriptId,
							expertId: "someone-else",
						}),
					},
				},
			}).deleteScript(scriptId),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("updates first step fields", async () => {
		const where = vi.fn().mockResolvedValue(undefined);
		const set = vi.fn().mockReturnValue({
			where,
		});
		const update = vi.fn().mockReturnValue({
			set,
		});

		await expect(
			createCaller({
				update,
			}).mutateFirstStep({
				scriptId,
				title: "Updated title",
				description: null,
				image: "image.png",
				categoryId: 10,
			}),
		).resolves.toBeUndefined();
		expect(set).toHaveBeenCalledWith(
			expect.objectContaining({
				title: "Updated title",
				description: "",
				image: "image.png",
				categoryId: 10,
			}),
		);
	});

	it("updates second step fields and creates or deletes criteria", async () => {
		const scriptFindFirst = vi.fn().mockResolvedValue({
			id: scriptId,
			expertId: "expert-1",
		});
		const updateWhere = vi.fn().mockResolvedValue(undefined);
		const updateSet = vi.fn().mockReturnValue({
			where: updateWhere,
		});
		const insertValues = vi.fn().mockResolvedValue(undefined);
		const insert = vi.fn().mockReturnValue({
			values: insertValues,
		});
		const deleteWhere = vi.fn().mockResolvedValue(undefined);
		const deleteSet = vi.fn().mockReturnValue({
			where: deleteWhere,
		});
		const criteriaUpdate = vi.fn().mockReturnValue({
			set: vi.fn().mockReturnValue({
				where: vi.fn().mockResolvedValue(undefined),
			}),
		});
		const transaction = vi.fn().mockImplementation(async (callback) =>
			callback({
				update: vi.fn().mockReturnValue({
					set: updateSet,
				}),
				insert,
				delete: vi.fn().mockReturnValue({
					where: deleteWhere,
				}),
			}),
		);

		await expect(
			createCaller({
				query: {
					scriptsTable: {
						findFirst: scriptFindFirst,
					},
				},
				transaction,
			}).mutateSecondStep({
				scriptId,
				context: "Updated context",
				criteria: [
					{
						id: "crit-1",
						typeId: 1,
						content: "Keep calm",
					},
					{
						id: null,
						typeId: 2,
						content: "Be specific",
					},
				],
				deletedCriteria: ["crit-2"],
			}),
		).resolves.toBeUndefined();
		expect(transaction).toHaveBeenCalledTimes(1);
		expect(insertValues).toHaveBeenCalledWith({
			scriptId,
			typeId: 2,
			content: "Be specific",
		});
	});

	it("rejects second step updates for missing or forbidden scripts", async () => {
		const missingCaller = createCaller({
			query: {
				scriptsTable: {
					findFirst: vi.fn().mockResolvedValue(null),
				},
			},
		});
		await expect(
			missingCaller.mutateSecondStep({
				scriptId,
				context: "Context",
				criteria: [{ id: null, typeId: 1, content: "Rule" }],
				deletedCriteria: null,
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });

		const forbiddenCaller = createCaller({
			query: {
				scriptsTable: {
					findFirst: vi.fn().mockResolvedValue({
						id: scriptId,
						expertId: "someone-else",
					}),
				},
			},
		});
		await expect(
			forbiddenCaller.mutateSecondStep({
				scriptId,
				context: "Context",
				criteria: [{ id: null, typeId: 1, content: "Rule" }],
				deletedCriteria: null,
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("updates third step questions and marks the draft as published", async () => {
		const scriptFindFirst = vi.fn().mockResolvedValue({
			id: scriptId,
			expertId: "expert-1",
		});
		const existingQuestionId = "question-1";
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
								id: "question-2",
							},
						]),
					}),
				}),
				select: vi.fn().mockReturnValue({
					from: vi.fn().mockReturnValue({
						where: vi.fn().mockResolvedValue([
							{
								id: "criterion-1",
							},
							{
								id: "criterion-2",
							},
						]),
					}),
				}),
				delete: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue(undefined),
				}),
			}),
		);

		await expect(
			createCaller({
				query: {
					scriptsTable: {
						findFirst: scriptFindFirst,
					},
				},
				transaction,
			}).mutateThirdStep({
				scriptId,
				questions: [
					{
						id: existingQuestionId,
						text: "Question one",
						specificCriteria: [
							{
								id: "criterion-1",
								content: "Keep eye contact",
							},
							{
								id: null,
								content: "Answer clearly",
							},
						],
					},
					{
						id: null,
						text: "Question two",
						specificCriteria: [
							{
								id: null,
								content: "Mention trade-offs",
							},
						],
					},
				],
				deletedQuestions: ["question-3"],
			}),
		).resolves.toBeUndefined();
		expect(transaction).toHaveBeenCalledTimes(1);

		await expect(
			createCaller({
				query: {
					scriptsTable: {
						findFirst: vi.fn().mockResolvedValue(null),
					},
				},
			}).mutateThirdStep({
				scriptId,
				questions: [],
				deletedQuestions: null,
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });

		await expect(
			createCaller({
				query: {
					scriptsTable: {
						findFirst: vi.fn().mockResolvedValue({
							id: scriptId,
							expertId: "someone-else",
						}),
					},
				},
			}).mutateThirdStep({
				scriptId,
				questions: [],
				deletedQuestions: null,
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });

		const emptyTransaction = vi.fn().mockImplementation(async (callback) =>
			callback({
				update: vi.fn().mockReturnValue({
					set: vi.fn().mockReturnValue({
						where: vi.fn().mockResolvedValue(undefined),
					}),
				}),
				insert: vi.fn().mockReturnValue({
					values: vi.fn().mockReturnValue({
						returning: vi.fn().mockResolvedValue([]),
					}),
				}),
				select: vi.fn().mockReturnValue({
					from: vi.fn().mockReturnValue({
						where: vi.fn().mockResolvedValue([]),
					}),
				}),
				delete: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue(undefined),
				}),
			}),
		);

		await expect(
			createCaller({
				query: {
					scriptsTable: {
						findFirst: scriptFindFirst,
					},
				},
				transaction: emptyTransaction,
			}).mutateThirdStep({
				scriptId,
				questions: [
					{
						id: null,
						text: "Question one",
						specificCriteria: [],
					},
				],
				deletedQuestions: null,
			}),
		).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
	});
});
