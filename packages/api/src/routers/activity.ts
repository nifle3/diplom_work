import { eq, desc } from "drizzle-orm";

import { db } from "@diplom_work/db";
import { interviewSessionsTable, scenariosTable } from "@diplom_work/db/schema/scheme";

import { router, basicAuthProtectedProcedure } from "../index";

export const activityRouter = router({
    getLatestUserActivity: basicAuthProtectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.session?.user.id;

        const activities = await db
            .select({
                id: interviewSessionsTable.id,
                title: scenariosTable.title,
                date: interviewSessionsTable.finishedAt,
            })
            .from(interviewSessionsTable)
            .innerJoin(scenariosTable, eq(interviewSessionsTable.scenarioId, scenariosTable.id))
            .where(eq(interviewSessionsTable.userId, userId))
            .orderBy(desc(interviewSessionsTable.finishedAt))
            .limit(3);

        return activities.filter(activity => activity.date !== null);
    }),
});
