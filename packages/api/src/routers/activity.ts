import { db } from "@diplom_work/db";
import {
	interviewSessionsTable,
	scriptsTable,
} from "@diplom_work/db/schema/scheme";
import { and, desc, eq, isNotNull } from "drizzle-orm";

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
			.where(
				and(
					eq(interviewSessionsTable.userId, userId),
					isNotNull(interviewSessionsTable.finishedAt),
				),
			)
			.orderBy(desc(interviewSessionsTable.finishedAt))
			.limit(3);

		return activities;
	}),
});
