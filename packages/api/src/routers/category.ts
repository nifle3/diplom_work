import { z } from "zod";
import { eq } from "drizzle-orm";

import { db } from "@diplom_work/db";

import { adminProcedure, protectedProcedure, router } from "..";
import { categoriesTable } from "@diplom_work/db/schema/scheme";
import { TRPCError } from "@trpc/server";

export const categoryRouter = router({
    getAll: protectedProcedure.query(async () => {
        const results = await db.query.categoriesTable.findMany({
            where: (categoriesTable, { isNull }) => isNull(categoriesTable.deletedAt),
        });
        return results;
    }),
    deleteById: adminProcedure
        .input(z.number())
        .mutation(async ({ input }) => {
            const result = await db.update(categoriesTable).set({
                deletedAt: new Date(),
            }).where(eq(categoriesTable.id, input)).returning();
            if (!result) {
                throw new TRPCError({code: "NOT_FOUND"});
            }
        }),
    updateById: adminProcedure
        .input(z.object({
            id: z.number(),
            name: z.string(),
        })).mutation(async ({ input }) => {
            const result = await db.update(categoriesTable).set({
                name: input.name,
                updatedAt: new Date(),
            }).where(eq(categoriesTable.id, input.id));

            if (!result) {
                throw new TRPCError({code: "NOT_FOUND"});
            }
        }),
    create: adminProcedure.
        input(z.string())
        .mutation(async ({ input }) => {
            await db.insert(categoriesTable).values({
                name: input,
                createdAt: new Date(),
            });
        }),
});