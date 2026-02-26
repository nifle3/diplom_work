import { eq, and, desc, isNull } from "drizzle-orm";

import { categoriesTable, scriptsTable } from "@diplom_work/db/schema/scheme";
import { db } from "@diplom_work/db";

import { protectedProcedure, router } from "..";


export const expertRouter = router({
    createNewDraft: protectedProcedure.mutation(async ({ctx}) => {
        
    }),
    getMyDrafts: protectedProcedure.query(async ({ctx}) => {

    }),
    getMyScenarios: protectedProcedure.query(async ({ ctx }) => {
        const scenarios = await db
            .select({
                id: scriptsTable.id,
                title: scriptsTable.title,
                context: scriptsTable.context,
                categoryName: categoriesTable.name,
            })
            .from(scriptsTable)
            .leftJoin(categoriesTable, eq(scriptsTable.categoryId, categoriesTable.id))
            .where(
                and(
                    eq(scriptsTable.expertId, ctx.session.user.id), 
                    isNull(scriptsTable.deletedAt)
                )
            )
            .orderBy(desc(scriptsTable.createdAt));

        return scenarios;
    }),
});