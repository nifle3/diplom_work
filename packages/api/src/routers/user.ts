import { db } from "@diplom_work/db";
import {
	interviewSessionsTable,
	usersTable,
} from "@diplom_work/db/schema/scheme";
import { statusToId } from "@diplom_work/domain/values/sessionStatus";
import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
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
			columns: { id: true },
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

		const completedDays = Array.from(
			new Set(
				sessions
					.map((session) => {
						const latestStatusLog = session.statusLogs[0];

						if (latestStatusLog?.statusId !== statusToId.complete) {
							return null;
						}

						return latestStatusLog.createdAt.toISOString().split("T")[0];
					})
					.filter((day): day is string => day !== null),
			),
		).sort((left, right) => right.localeCompare(left));

		if (completedDays.length === 0) return 0;

		const today = new Date();
		today.setUTCHours(0, 0, 0, 0);
		const todayKey = today.toISOString().split("T")[0];

		const yesterday = new Date(today);
		yesterday.setUTCDate(yesterday.getUTCDate() - 1);
		const yesterdayKey = yesterday.toISOString().split("T")[0];

		if (completedDays[0] !== todayKey && completedDays[0] !== yesterdayKey) {
			return 0;
		}

		let streak = 0;
		let expectedDay = completedDays[0];

		for (const dayString of completedDays) {
			if (dayString === expectedDay) {
				streak++;
				const expectedDate = new Date(`${expectedDay}T00:00:00.000Z`);
				expectedDate.setUTCDate(expectedDate.getUTCDate() - 1);
				expectedDay = expectedDate.toISOString().split("T")[0];
				continue;
			}

			break;
		}

		return streak;
	}),
});
