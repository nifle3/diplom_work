import { db } from "@diplom_work/db";
import {
	interviewSessionsTable,
	usersTable,
} from "@diplom_work/db/schema/scheme";
import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { calculateStreakFromSessions } from "../achievements/metrics";
import { protectedProcedure, router } from "../init/routers";

export const userRouter = router({
	getStats: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session?.user.id;
		const users = await db
			.select()
			.from(usersTable)
			.where(eq(usersTable.id, userId))
			.limit(1);
		const { 0: user } = users;

		if (!user) {
			throw new TRPCError({ code: "NOT_FOUND" });
		}

		return {
			name: user?.name,
			xp: user?.xp,
		};
	}),
	getStreak: protectedProcedure.query(async ({ ctx }) => {
		const sessions = await db.query.interviewSessionsTable.findMany({
			columns: {
				id: true,
				startedAt: true,
				finalScore: true,
			},
			where: eq(interviewSessionsTable.userId, ctx.session.user.id),
			with: {
				statusLogs: {
					columns: {
						statusId: true,
						createdAt: true,
					},
					orderBy: (statusLogs, { desc }) => [desc(statusLogs.createdAt)],
					limit: 1,
				},
			},
			orderBy: [desc(interviewSessionsTable.startedAt)],
		});

		return calculateStreakFromSessions(sessions);
	}),
});
