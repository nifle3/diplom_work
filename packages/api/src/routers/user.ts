import { db } from "@diplom_work/db";
import {
	interviewSessionsTable,
	usersTable,
} from "@diplom_work/db/schema/scheme";
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
			columns: { startedAt: true },
			where: eq(interviewSessionsTable.userId, ctx.session.user.id),
			orderBy: [desc(interviewSessionsTable.startedAt)],
		});

		if (sessions.length === 0) return 0;

		const uniqueDays = Array.from(
			new Set(
				sessions.map(
					(session) => session.startedAt.toISOString().split("T")[0],
				),
			),
		);

		let streak = 0;

		const today = new Date();
		today.setUTCHours(0, 0, 0, 0);

		const yesterday = new Date(today);
		yesterday.setUTCDate(yesterday.getUTCDate() - 1);

		if (!uniqueDays[0]) {
			return 0;
		}

		const lastActivityDate = new Date(uniqueDays[0]);

		if (lastActivityDate < yesterday) {
			return 0;
		}

		const expectedDate = lastActivityDate;

		for (const dayString of uniqueDays) {
			if (!dayString) {
				break;
			}

			const currentDate = new Date(dayString);

			if (currentDate.getTime() === expectedDate.getTime()) {
				streak++;
				expectedDate.setUTCDate(expectedDate.getUTCDate() - 1);
			} else {
				break;
			}
		}

		return streak;
	}),
});
