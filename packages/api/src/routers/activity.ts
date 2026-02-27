import { db } from "@diplom_work/db";
import {
	interviewSessionsTable,
	scriptsTable,
} from "@diplom_work/db/schema/scheme";
import { desc, eq } from "drizzle-orm";

import { protectedProcedure, router } from "../index";

export const activityRouter = router({
	getLatestUserActivity: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session?.user.id;

		const activities = await db
			.select({
				id: interviewSessionsTable.id,
				title: scriptsTable.title,
				date: interviewSessionsTable.finishedAt,
			})
			.from(interviewSessionsTable)
			.innerJoin(
				scriptsTable,
				eq(interviewSessionsTable.scriptId, scriptsTable.id),
			)
			.where(eq(interviewSessionsTable.userId, userId))
			.orderBy(desc(interviewSessionsTable.finishedAt))
			.limit(3);

		return activities.filter((activity) => activity.date !== null);
	}),
});
