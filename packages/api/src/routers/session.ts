import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { db } from "@diplom_work/db/index";
import { interviewSessionsTable } from "@diplom_work/db/schema/scheme";

import { protectedProcedure, router } from "..";

export const sessionRouter = router({
    createNewSession: protectedProcedure
        .input(z.string())
        .mutation(async ({ ctx, input }) => {
            const { 0: result } = await db.insert(interviewSessionsTable).values({
                userId: ctx.session.user.id,
                startedAt: new Date(),
                scriptId: input,
            }).returning();

            if (!result) {
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
            }

            return result.id;
        }),
    getScriptByInterviewId: protectedProcedure.
        input(z.uuid())
        .query(async ({ ctx, input }) => {
            const result = await db.query.interviewSessionsTable.findFirst({
                where: (interviewSessionsTable, { eq, and }) => and(
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
                where: (chatMessagesTable, { eq }) => eq(chatMessagesTable.sessionId, input),
                with: {
                    session: {
                        columns: {
                            userId: true,
                        }
                    }
                }
            });
            return results.filter((val) => val.session.userId == ctx.session.user.id);
        }),
    addNewMessage: protectedProcedure
        .input()
        .mutation(async ({ ctx, input }) => {

        }),
    startNewConversation: protectedProcedure
        .input(z.string())
        .mutation(async ({ ctx, input }) => {

        })
});