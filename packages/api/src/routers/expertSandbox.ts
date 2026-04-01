import { db } from "@diplom_work/db/index";
import {
	chatMessagesTable,
	interviewSessionsTable,
} from "@diplom_work/db/schema/scheme";
import { evaluateAnswer, planInterviewStep, summarize } from "@diplom_work/llm";
import { TRPCError } from "@trpc/server";
import { and, asc, eq, inArray, isNull } from "drizzle-orm";
import { z } from "zod";

import { expertProcedure, router } from "../init/routers";

const sandboxAnswerSchema = z.object({
	sessionId: z.uuid(),
	content: z.string().min(1).max(4000),
});

const rewindSandboxSchema = z.object({
	sessionId: z.uuid(),
	messageId: z.uuid(),
});

type SandboxMessage = {
	id: string;
	isAi: boolean;
	messageText: string;
	analysisNote: string | null;
	createdAt: Date;
};

type ConversationItem = {
	question: string;
	answer: string;
};

function buildConversation(
	messages: Array<Pick<SandboxMessage, "isAi" | "messageText">>,
	pendingAnswer?: string,
) {
	const conversation: ConversationItem[] = [];

	for (const message of messages) {
		if (message.isAi) {
			conversation.push({
				question: message.messageText,
				answer: "",
			});
			continue;
		}

		const lastItem = conversation.at(-1);
		if (lastItem && !lastItem.answer) {
			lastItem.answer = message.messageText;
			continue;
		}

		conversation.push({
			question: "",
			answer: message.messageText,
		});
	}

	if (typeof pendingAnswer === "string") {
		const lastItem = conversation.at(-1);
		if (lastItem && !lastItem.answer) {
			lastItem.answer = pendingAnswer;
		} else {
			conversation.push({
				question: "",
				answer: pendingAnswer,
			});
		}
	}

	return conversation.filter(
		(item) => item.question.trim() && item.answer.trim(),
	);
}

async function rebuildSummary(
	messages: Array<Pick<SandboxMessage, "isAi" | "messageText">>,
) {
	const conversation = buildConversation(messages);
	let summary = "";

	for (const pair of conversation) {
		summary = await summarize({
			humanResponse: pair.answer,
			aiQuestion: pair.question,
			prevSummarization: summary,
		});
	}

	return summary || null;
}

async function loadSandboxSession(sessionId: string, userId: string) {
	return db.query.interviewSessionsTable.findFirst({
		where: (interviewSessionsTable, { and, eq }) =>
			and(
				eq(interviewSessionsTable.id, sessionId),
				eq(interviewSessionsTable.userId, userId),
			),
		columns: {
			id: true,
			currentQuestionIndex: true,
			summarize: true,
			startedAt: true,
		},
		with: {
			script: {
				columns: {
					id: true,
					title: true,
					description: true,
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
}

export const expertSandboxRouter = router({
	createSession: expertProcedure
		.input(z.uuid())
		.mutation(async ({ ctx, input }) => {
			const script = await db.query.scriptsTable.findFirst({
				where: (scriptsTable, { and, eq, isNull }) =>
					and(
						eq(scriptsTable.id, input),
						eq(scriptsTable.expertId, ctx.session.user.id),
						isNull(scriptsTable.deletedAt),
					),
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
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Сценарий не найден",
				});
			}

			if (!script.context) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "У сценария должен быть заполненный контекст",
				});
			}

			const firstQuestion = script.questions[0]?.text;
			if (!firstQuestion) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Сценарий должен содержать хотя бы один вопрос",
				});
			}

			const session = await db.transaction(async (tx) => {
				const [createdSession] = await tx
					.insert(interviewSessionsTable)
					.values({
						currentQuestionIndex: 0,
						userId: ctx.session.user.id,
						startedAt: new Date(),
						scriptId: input,
					})
					.returning();

				if (!createdSession) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Не удалось создать sandbox-сессию",
					});
				}

				await tx.insert(chatMessagesTable).values({
					sessionId: createdSession.id,
					isAi: true,
					messageText: firstQuestion,
				});

				return createdSession;
			});

			return session.id;
		}),
	getSession: expertProcedure.input(z.uuid()).query(async ({ ctx, input }) => {
		const session = await loadSandboxSession(input, ctx.session.user.id);

		if (!session) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Sandbox-сессия не найдена",
			});
		}

		return session;
	}),
	sendAnswer: expertProcedure
		.input(sandboxAnswerSchema)
		.mutation(async ({ ctx, input }) => {
			const session = await loadSandboxSession(
				input.sessionId,
				ctx.session.user.id,
			);

			if (!session) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Sandbox-сессия не найдена",
				});
			}

			const currentTopic =
				session.script.questions[session.currentQuestionIndex];
			if (!currentTopic) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "У сценария нет текущего вопроса",
				});
			}

			const lastMessage = session.messages.at(-1);
			if (!lastMessage?.isAi) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Сессия уже ждёт отката к предыдущему ответу",
				});
			}

			const summary = await summarize({
				humanResponse: input.content,
				aiQuestion: lastMessage.messageText,
				prevSummarization: session.summarize ?? "",
			});

			const answerEvaluation = await evaluateAnswer({
				mode: "answer",
				context: session.script.context ?? "",
				question: lastMessage.messageText,
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

			const updatedConversation = [
				...session.messages,
				{
					isAi: false,
					messageText: input.content,
				},
			];

			const nextTopic =
				session.script.questions[session.currentQuestionIndex + 1];

			const step = await planInterviewStep({
				context: session.script.context ?? "",
				summary,
				currentTopic: currentTopic.text,
				currentTopicCriteria: currentTopic.specificCriteria.map(
					(criterion) => criterion.content,
				),
				globalCriteria: session.script.globalCriteria.map((criterion) => ({
					type: criterion.type.name,
					content: criterion.content,
				})),
				latestQuestion: lastMessage.messageText,
				latestAnswer: input.content,
				nextTopic: nextTopic?.text,
				nextTopicCriteria:
					nextTopic?.specificCriteria.map((criterion) => criterion.content) ??
					[],
			});
			const finalEvaluation =
				step.decision === "finish"
					? await evaluateAnswer({
							mode: "session",
							context: session.script.context ?? "",
							summary,
							conversation: buildConversation(updatedConversation),
							globalCriteria: session.script.globalCriteria.map(
								(criterion) => ({
									type: criterion.type.name,
									content: criterion.content,
								}),
							),
							specificCriteria: session.script.questions.flatMap((question) =>
								question.specificCriteria.map((criterion) => criterion.content),
							),
						})
					: null;

			const result = await db.transaction(async (tx) => {
				await tx
					.update(interviewSessionsTable)
					.set({
						summarize: summary,
					})
					.where(eq(interviewSessionsTable.id, input.sessionId));

				await tx.insert(chatMessagesTable).values({
					sessionId: input.sessionId,
					isAi: false,
					messageText: input.content,
					analysisNote: answerEvaluation.analysisNote,
				});

				if (step.decision === "finish") {
					return {
						type: "finished" as const,
						finalEvaluation,
						analysisNote: answerEvaluation.analysisNote,
						currentQuestionIndex: session.currentQuestionIndex,
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

				const [nextMessage] = await tx
					.insert(chatMessagesTable)
					.values({
						sessionId: input.sessionId,
						isAi: true,
						messageText: nextQuestionText,
					})
					.returning();

				if (!nextMessage) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Не удалось создать следующий вопрос",
					});
				}

				return {
					type: "next-question" as const,
					currentQuestionIndex: nextQuestionIndex,
					message: {
						id: nextMessage.id,
						isAi: nextMessage.isAi,
						messageText: nextMessage.messageText,
						createdAt: nextMessage.createdAt,
					},
					analysisNote: answerEvaluation.analysisNote,
				};
			});

			return result;
		}),
	rewindSession: expertProcedure
		.input(rewindSandboxSchema)
		.mutation(async ({ ctx, input }) => {
			const session = await loadSandboxSession(
				input.sessionId,
				ctx.session.user.id,
			);

			if (!session) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Sandbox-сессия не найдена",
				});
			}

			const selectedIndex = session.messages.findIndex(
				(message) => message.id === input.messageId,
			);

			if (selectedIndex < 0) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Сообщение не найдено",
				});
			}

			const selectedMessage = session.messages[selectedIndex];
			if (!selectedMessage || selectedMessage.isAi) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Можно откатиться только к своему ответу",
				});
			}

			const keptMessages = session.messages.slice(0, selectedIndex + 1);
			const removedIds = session.messages
				.slice(selectedIndex + 1)
				.map((message) => message.id);

			const summary = await rebuildSummary(keptMessages);
			const nextQuestionIndex = Math.max(
				0,
				keptMessages.filter((message) => message.isAi).length - 1,
			);

			await db.transaction(async (tx) => {
				if (removedIds.length > 0) {
					await tx
						.delete(chatMessagesTable)
						.where(inArray(chatMessagesTable.id, removedIds));
				}

				await tx
					.update(interviewSessionsTable)
					.set({
						currentQuestionIndex: nextQuestionIndex,
						summarize: summary,
					})
					.where(eq(interviewSessionsTable.id, input.sessionId));
			});

			return {
				messageText: selectedMessage.messageText,
				messages: keptMessages,
				currentQuestionIndex: nextQuestionIndex,
			};
		}),
});
