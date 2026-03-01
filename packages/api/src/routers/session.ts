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
    getAllHistory: protectedProcedure
        .input(z.string())
        .query(async ({ ctx, input }) => {

        }),
    startNewConversation: protectedProcedure
        .input(z.string())
        .mutation(async ({ ctx, input }) => {

        })
});