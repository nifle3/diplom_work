import { db } from "@diplom_work/db/index";
import {
	chatMessagesTable,
	interviewSessionsTable,
	sessionsTable,
} from "@diplom_work/db/schema/scheme";
import { getFirstQuestion, getNextQuestion, summarize } from "@diplom_work/llm";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "..";

const addNewMessageScheme = z.object({
	sessionId: z.uuid(),
	content: z.string().min(1).max(4000),
});

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
	getAllHistory: protectedProcedure
		.input(z.string())
		.query(async ({ ctx, input }) => {
			const results = await db
				.select({
					id: chatMessagesTable.id,
					messageText: chatMessagesTable.messageText,
					isAi: chatMessagesTable.isAi,
					createdAt: chatMessagesTable.createdAt,
					sessionId: chatMessagesTable.sessionId,
				})
				.from(chatMessagesTable)
				.innerJoin(
					sessionsTable,
					eq(chatMessagesTable.sessionId, sessionsTable.id),
				)
				.where(
					and(
						eq(chatMessagesTable.sessionId, input),
						eq(sessionsTable.userId, ctx.session.user.id),
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
});
