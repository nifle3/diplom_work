import { db } from "@diplom_work/db/index";
import {
	chatMessagesTable,
	interviewSessionsTable,
	usersTable,
} from "@diplom_work/db/schema/scheme";
import { evaluateAnswer, planInterviewStep, summarize } from "@diplom_work/llm";
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

type TransactionClient = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function finalizeSession(
	tx: TransactionClient,
	userId: string,
	sessionId: string,
	now: Date,
) {
	const session = await tx.query.interviewSessionsTable.findFirst({
		where: (interviewSessionsTable, { and, eq }) =>
			and(
				eq(interviewSessionsTable.id, sessionId),
				eq(interviewSessionsTable.userId, userId),
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
						where: (questions, { isNull }) => isNull(questions.deletedAt),
						orderBy: (questions, { asc }) => [asc(questions.order)],
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
		where: (usersTable, { eq }) => eq(usersTable.id, userId),
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
		.where(eq(interviewSessionsTable.id, sessionId));

	await tx
		.update(usersTable)
		.set({
			currentStreak: nextStreak,
			lastActivityDate: now,
		})
		.where(eq(usersTable.id, userId));

	return {
		streakUpdated: true,
		currentStreak: nextStreak,
	};
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
						where: (questions, { isNull }) => isNull(questions.deletedAt),
						orderBy: (questions, { asc }) => [asc(questions.order)],
						columns: {
							text: true,
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

			const firstTopic = script.questions[0]?.text;

			if (!firstTopic) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Interview script must contain at least one question",
				});
			}

			const result = await db.transaction(async (tx) => {
				const { 0: addedSession } = await tx
					.insert(interviewSessionsTable)
					.values({
						currentQuestionIndex: 0,
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
					messageText: firstTopic,
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
				columns: {
					currentQuestionIndex: true,
					summarize: true,
				},
				with: {
					messages: {
						where: (messages, { eq }) => eq(messages.isAi, true),
						orderBy: (messages, { desc }) => [desc(messages.createdAt)],
						limit: 1,
					},
					script: {
						columns: {
							context: true,
						},
						with: {
							questions: {
								where: (questions, { isNull }) => isNull(questions.deletedAt),
								orderBy: (questions, { asc }) => [asc(questions.order)],
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
					},
				},
			});

			if (!session) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			const lastAiMessage = session.messages[0];

			if (!lastAiMessage) {
				throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
			}

			const currentTopic =
				session.script.questions[session.currentQuestionIndex];

			if (!currentTopic) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Interview script does not have an active topic",
				});
			}

			const sum = await summarize({
				humanResponse: input.content,
				aiQuestion: lastAiMessage.messageText,
				prevSummarization: session.summarize ?? "",
			});

			const answerEvaluation = await evaluateAnswer({
				mode: "answer",
				context: session.script.context ?? "",
				question: lastAiMessage.messageText,
				answer: input.content,
				summary: session.summarize ?? undefined,
				globalCriteria: session.script.globalCriteria.map((criterion) => ({
					type: criterion.type.name,
					content: criterion.content,
				})),
				specificCriteria: currentTopic.specificCriteria.map(
					(criterion) => criterion.content,
				),
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

				const nextTopic =
					session.script.questions[session.currentQuestionIndex + 1] ?? null;

				const step = await planInterviewStep({
					context: session.script.context ?? "",
					summary: sum,
					currentTopic: currentTopic.text,
					currentTopicCriteria: currentTopic.specificCriteria.map(
						(criterion) => criterion.content,
					),
					globalCriteria: session.script.globalCriteria.map((criterion) => ({
						type: criterion.type.name,
						content: criterion.content,
					})),
					latestQuestion: lastAiMessage.messageText,
					latestAnswer: input.content,
					nextTopic: nextTopic?.text,
					nextTopicCriteria:
						nextTopic?.specificCriteria.map((criterion) => criterion.content) ??
						[],
				});

				if (step.decision === "finish") {
					const finalized = await finalizeSession(
						tx,
						ctx.session.user.id,
						input.sessionId,
						new Date(),
					);

					return {
						type: "finished" as const,
						result: finalized,
					};
				}

				const nextQuestionText =
					step.question.trim() || nextTopic?.text || currentTopic.text;
				const nextQuestionIndex =
					step.decision === "next_topic" && nextTopic
						? session.currentQuestionIndex + 1
						: session.currentQuestionIndex;

				await tx
					.update(interviewSessionsTable)
					.set({
						currentQuestionIndex: nextQuestionIndex,
					})
					.where(eq(interviewSessionsTable.id, input.sessionId));

				const { 0: message } = await tx
					.insert(chatMessagesTable)
					.values({
						sessionId: input.sessionId,
						isAi: true,
						messageText: nextQuestionText,
					})
					.returning();

				if (!message) {
					throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
				}

				return {
					type: "next-question" as const,
					message,
				};
			});

			if (result.type === "finished") {
				return result;
			}

			return {
				type: "next-question" as const,
				message: {
					id: result.message.id,
					isAi: result.message.isAi,
					messageText: result.message.messageText,
					createdAt: result.message.createdAt,
				},
			};
		}),
	finishSession: protectedProcedure
		.input(z.uuid())
		.mutation(async ({ ctx, input }) => {
			const now = new Date();

			return db.transaction((tx) =>
				finalizeSession(tx, ctx.session.user.id, input, now),
			);
		}),
});
