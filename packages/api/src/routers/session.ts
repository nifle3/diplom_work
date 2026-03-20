import { db } from "@diplom_work/db/index";
import {
	chatMessagesTable,
	interviewSessionsTable,
	usersTable,
} from "@diplom_work/db/schema/scheme";
import {
	evaluateAnswer,
	getFirstQuestion,
	getNextQuestion,
	summarize,
} from "@diplom_work/llm";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../init/routers";

const addNewMessageScheme = z.object({
	sessionId: z.uuid(),
	content: z.string().min(1).max(4000),
});

const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;

function getUtcDayStart(date: Date) {
	return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function getUtcDayDifference(current: Date, previous: Date) {
	return Math.floor(
		(getUtcDayStart(current) - getUtcDayStart(previous)) / MILLISECONDS_IN_DAY,
	);
}

export const sessionRouter = router({
	createNewSession: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx, input }) => {
			const script = await db.query.scriptsTable.findFirst({
				where: (scriptsTable, { and, eq, isNull }) =>
					and(eq(scriptsTable.id, input), isNull(scriptsTable.deletedAt)),
				columns: {
					context: true,
				},
				with: {
				questions: {
					columns: {
						text: true,
					},
				},
				globalCriteria: {
					columns: {
						content: true,
					},
					with: {
						type: {
							columns: {
								name: true,
							},
						},
					},
				},
			},
		});

			if (!script) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			if (!script.context) {
				throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
			}

			const text = await getFirstQuestion({
				context: script.context,
				questionExamples: script.questions.map((val) => val.text),
			});

			const result = await db.transaction(async (tx) => {
				const { 0: addedSession } = await tx
					.insert(interviewSessionsTable)
					.values({
						userId: ctx.session.user.id,
						startedAt: new Date(),
						scriptId: input,
					})
					.returning();

				if (!addedSession) {
					throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
				}

				await tx.insert(chatMessagesTable).values({
					sessionId: addedSession.id,
					isAi: true,
					messageText: text,
				});

				return addedSession;
			});

			return result.id;
		}),
	getScriptByInterviewId: protectedProcedure
		.input(z.uuid())
		.query(async ({ ctx, input }) => {
			const result = await db.query.interviewSessionsTable.findFirst({
				where: (interviewSessionsTable, { eq, and }) =>
					and(
						eq(interviewSessionsTable.id, input),
						eq(interviewSessionsTable.userId, ctx.session.user.id),
					),
				with: {
					script: true,
				},
			});
			if (!result) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			return result.script;
		}),
	getResultBySessionId: protectedProcedure
		.input(z.uuid())
		.query(async ({ ctx, input }) => {
			const session = await db.query.interviewSessionsTable.findFirst({
				where: (interviewSessionsTable, { eq, and }) =>
					and(
						eq(interviewSessionsTable.id, input),
						eq(interviewSessionsTable.userId, ctx.session.user.id),
					),
				columns: {
					id: true,
					status: true,
					finalScore: true,
					expertFeedback: true,
					startedAt: true,
					finishedAt: true,
				},
				with: {
					script: {
						columns: {
							id: true,
							title: true,
							description: true,
						},
					},
					messages: {
						columns: {
							id: true,
							isAi: true,
							messageText: true,
							analysisNote: true,
							createdAt: true,
						},
						orderBy: (messages, { asc }) => [asc(messages.createdAt)],
					},
				},
			});

			if (!session) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			const questions = session.messages.reduce<
				Array<{
					id: string;
					question: string;
					answer: string | null;
					analysisNote: string | null;
					askedAt: Date;
					answeredAt: Date | null;
				}>
			>((acc, message) => {
				if (message.isAi) {
					acc.push({
						id: message.id,
						question: message.messageText,
						answer: null,
						analysisNote: null,
						askedAt: message.createdAt,
						answeredAt: null,
					});
					return acc;
				}

				const lastQuestion = acc.at(-1);

				if (!lastQuestion || lastQuestion.answer !== null) {
					return acc;
				}

				lastQuestion.answer = message.messageText;
				lastQuestion.analysisNote = message.analysisNote;
				lastQuestion.answeredAt = message.createdAt;

				return acc;
			}, []);

			return {
				...session,
				questions,
			};
		}),
	getAllHistory: protectedProcedure
		.input(z.string())
		.query(async ({ ctx, input }) => {
			const results = await db
				.select({
					id: chatMessagesTable.id,
					messageText: chatMessagesTable.messageText,
					isAi: chatMessagesTable.isAi,
					analysisNote: chatMessagesTable.analysisNote,
					createdAt: chatMessagesTable.createdAt,
					sessionId: chatMessagesTable.sessionId,
				})
				.from(chatMessagesTable)
				.innerJoin(
					interviewSessionsTable,
					eq(chatMessagesTable.sessionId, interviewSessionsTable.id),
				)
				.where(
					and(
						eq(chatMessagesTable.sessionId, input),
						eq(interviewSessionsTable.userId, ctx.session.user.id),
					),
				);
			return results;
		}),
	addNewMessage: protectedProcedure
		.input(addNewMessageScheme)
		.mutation(async ({ ctx, input }) => {
			const session = await db.query.interviewSessionsTable.findFirst({
				where: (interviewSessionsTable, { eq, and }) =>
					and(
						eq(interviewSessionsTable.userId, ctx.session.user.id),
						eq(interviewSessionsTable.id, input.sessionId),
						eq(interviewSessionsTable.status, "active"),
					),
				with: {
					messages: {
						where: (messages, { eq }) => eq(messages.isAi, true),
						orderBy: (messages, { desc }) => [desc(messages.createdAt)],
						limit: 1,
					},
				},
			});

			if (!session) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			const script = await db.query.scriptsTable.findFirst({
				where: (scriptsTable, { eq, and, isNull }) =>
					and(
						eq(scriptsTable.id, session.scriptId),
						isNull(scriptsTable.deletedAt),
					),
				with: {
					questions: {
						columns: {
							text: true,
						},
					},
					globalCriteria: {
						columns: {
							content: true,
						},
						with: {
							type: {
								columns: {
									name: true,
								},
							},
						},
					},
				},
			});

			if (!script) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			const lastAiMessage = session.messages[0];

			if (!lastAiMessage) {
				throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
			}

			const sum = await summarize({
				humanResponse: input.content,
				aiQuestion: lastAiMessage.messageText,
				prevSummarization: session.summarize ?? "",
			});

			const answerEvaluation = await evaluateAnswer({
				mode: "answer",
				context: script.context ?? "",
				question: lastAiMessage.messageText,
				answer: input.content,
				summary: session.summarize ?? undefined,
				globalCriteria: script.globalCriteria.map((criterion) => ({
					type: criterion.type.name,
					content: criterion.content,
				})),
				specificCriteria: [],
			});

			const newQuestion = await getNextQuestion({
				context: script.context ?? "",
				questionExamples: script.questions.map((val) => val.text),
				summarize: sum,
			});

			const result = await db.transaction(async (tx) => {
				await tx
					.update(interviewSessionsTable)
					.set({
						summarize: sum,
					})
					.where(eq(interviewSessionsTable.id, input.sessionId));

				await tx.insert(chatMessagesTable).values({
					sessionId: input.sessionId,
					isAi: false,
					messageText: input.content,
					analysisNote: answerEvaluation.analysisNote,
				});

				const { 0: result } = await tx
					.insert(chatMessagesTable)
					.values({
						sessionId: input.sessionId,
						isAi: true,
						messageText: newQuestion,
					})
					.returning();

				if (!result) {
					throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
				}

				return result;
			});

			return {
				id: result.id,
				isAi: result.isAi,
				messageText: result.messageText,
				createdAt: result.createdAt,
			};
		}),
	finishSession: protectedProcedure
		.input(z.uuid())
		.mutation(async ({ ctx, input }) => {
			const now = new Date();

			return db.transaction(async (tx) => {
				const session = await tx.query.interviewSessionsTable.findFirst({
					where: (interviewSessionsTable, { and, eq }) =>
						and(
							eq(interviewSessionsTable.id, input),
							eq(interviewSessionsTable.userId, ctx.session.user.id),
						),
					columns: {
						id: true,
						status: true,
						finishedAt: true,
						summarize: true,
					},
					with: {
						messages: {
							columns: {
								isAi: true,
								messageText: true,
							},
							orderBy: (messages, { asc }) => [asc(messages.createdAt)],
						},
						script: {
							columns: {
								context: true,
							},
							with: {
								globalCriteria: {
									columns: {
										content: true,
									},
									with: {
										type: {
											columns: {
												name: true,
											},
										},
									},
								},
								questions: {
									columns: {
										text: true,
									},
									with: {
										specificCriteria: {
											columns: {
												content: true,
											},
										},
									},
								},
							},
						},
					},
				});

				if (!session) {
					throw new TRPCError({ code: "NOT_FOUND" });
				}

				if (session.status === "complete") {
					return {
						streakUpdated: false,
					};
				}

				const conversation = session.messages.reduce<
					Array<{ question: string; answer: string }>
				>((acc, message) => {
					if (message.isAi) {
						acc.push({
							question: message.messageText,
							answer: "",
						});
						return acc;
					}

					const lastItem = acc.at(-1);
					if (lastItem && !lastItem.answer) {
						lastItem.answer = message.messageText;
						return acc;
					}

					acc.push({
						question: "",
						answer: message.messageText,
					});
					return acc;
				}, []);

				const normalizedConversation = conversation.filter(
					(item) => item.question.trim() && item.answer.trim(),
				);

				const finalEvaluation =
					normalizedConversation.length > 0
						? await evaluateAnswer({
								mode: "session",
								context: session.script.context ?? "",
								summary: session.summarize ?? undefined,
								conversation: normalizedConversation,
								globalCriteria: session.script.globalCriteria.map((criterion) => ({
									type: criterion.type.name,
									content: criterion.content,
								})),
								specificCriteria: session.script.questions.flatMap((question) =>
									question.specificCriteria.map((criterion) => criterion.content),
								),
							})
						: null;

				const user = await tx.query.usersTable.findFirst({
					where: (usersTable, { eq }) =>
						eq(usersTable.id, ctx.session.user.id),
					columns: {
						currentStreak: true,
						lastActivityDate: true,
					},
				});

				if (!user) {
					throw new TRPCError({ code: "NOT_FOUND" });
				}

				let nextStreak = 1;

				if (user.lastActivityDate) {
					const daysDifference = getUtcDayDifference(now, user.lastActivityDate);

					if (daysDifference <= 0) {
						nextStreak = user.currentStreak;
					} else if (daysDifference === 1) {
						nextStreak = user.currentStreak + 1;
					}
				}

				await tx
					.update(interviewSessionsTable)
					.set({
						status: "complete",
						finishedAt: now,
						finalScore: finalEvaluation?.score ?? null,
						expertFeedback: finalEvaluation?.feedback ?? null,
					})
					.where(eq(interviewSessionsTable.id, input));

				await tx
					.update(usersTable)
					.set({
						currentStreak: nextStreak,
						lastActivityDate: now,
					})
					.where(eq(usersTable.id, ctx.session.user.id));

				return {
					streakUpdated: true,
					currentStreak: nextStreak,
				};
			});
		}),
});
