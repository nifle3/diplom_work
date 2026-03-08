import { db } from "@diplom_work/db/index";
import {
	chatMessagesTable,
	interviewSessionsTable,
} from "@diplom_work/db/schema/scheme";
import { getFirstQuestion } from "@diplom_work/llm";
import { TRPCError } from "@trpc/server";
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

				const script = await tx.query.scriptsTable.findFirst({
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
			const results = await db.query.chatMessagesTable.findMany({
				where: (chatMessagesTable, { eq }) =>
					eq(chatMessagesTable.sessionId, input),
				with: {
					session: {
						columns: {
							userId: true,
						},
					},
				},
			});
			return results.filter(
				(val) => val.session.userId === ctx.session.user.id,
			);
		}),
	addNewMessage: protectedProcedure
		.input(addNewMessageScheme)
		.mutation(async ({ ctx, input }) => {
			//
		}),
});
