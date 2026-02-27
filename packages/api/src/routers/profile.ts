import { db } from "@diplom_work/db/index" 

import { protectedProcedure, router } from "..";
import { TRPCError } from "@trpc/server";

export const profileRouter = router({
    getMyProfile: protectedProcedure.query(async ({ctx}) => {
        const user = await db.query.usersTable.findFirst({
            where: (usersTable, {and, eq, isNull}) => and(
                eq(usersTable.id, ctx.session.user.id),
                isNull(usersTable.deletedAt)
            )
        });

        if (!user) {
            throw new TRPCError({code: "NOT_FOUND"});
        }

        return user;
    }),
    getMyHistory: protectedProcedure.query(async ({ctx}) => {
        await db.query.interviewSessionsTable.findMany({
            where: (interviewSessionsTable, {eq, and}) => and(
                eq(interviewSessionsTable.userId, ctx.session.user.id)
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
                    }
                }
            }
        })
    }),
    getMyAchivements: protectedProcedure.query(async ({ctx}) => {

    }) 
});