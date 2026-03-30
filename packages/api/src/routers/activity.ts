import { db } from "@diplom_work/db";
import { statusToId } from "@diplom_work/domain/values/sessionStatus";

import { protectedProcedure, router } from "../init/routers";

type SessionStatusLog = {
	statusId: number;
	createdAt: Date;
};

type Activity = {
	id: string;
	title: string;
	date: Date;
};

export const activityRouter = router({
	getLatestUserActivity: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session?.user.id;

		const sessions = await db.query.interviewSessionsTable.findMany({
			where: (interviewSessionsTable, { eq }) =>
				eq(interviewSessionsTable.userId, userId),
			columns: {
				id: true,
			},
			with: {
				script: {
					columns: {
						title: true,
					},
				},
				statusLogs: {
					columns: {
						statusId: true,
						createdAt: true,
					},
					orderBy: (statusLogs, { desc }) => [desc(statusLogs.createdAt)],
					limit: 1,
				},
			},
			orderBy: (interviewSessionsTable, { desc }) => [
				desc(interviewSessionsTable.startedAt),
			],
		});

		const activities = sessions
			.map((session) => {
				const latestStatusLog = session.statusLogs[0] as
					| SessionStatusLog
					| undefined;

				if (
					latestStatusLog?.statusId !== statusToId.complete &&
					latestStatusLog?.statusId !== statusToId.canceled
				) {
					return null;
				}

				return {
					id: session.id,
					title: session.script.title,
					date: latestStatusLog.createdAt,
				};
			})
			.filter((activity): activity is Activity => activity !== null)
			.sort((left, right) => right.date.getTime() - left.date.getTime())
			.slice(0, 3);

		return activities;
	}),
});
