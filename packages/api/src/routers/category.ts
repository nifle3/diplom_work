import { categoriesTable } from "@diplom_work/db/schema/scheme";
import { logger } from "@diplom_work/logger/server";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { adminProcedure, protectedProcedure, router } from "../init/routers";

export const categoryRouter = router({
	getAll: protectedProcedure.query(async ({ ctx }) => {
		const results = await ctx.db.query.categoriesTable.findMany({
			where: (categoriesTable, { isNull }) => isNull(categoriesTable.deletedAt),
		});
		return results;
	}),
	deleteById: adminProcedure
		.input(z.number())
		.mutation(async ({ input, ctx }) => {
			const result = await ctx.db
				.update(categoriesTable)
				.set({
					deletedAt: new Date(),
				})
				.where(eq(categoriesTable.id, input))
				.returning();
			if (!result) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			logger.info({ categoryId: input }, "Deleted category");
		}),
	updateById: adminProcedure
		.input(
			z.object({
				id: z.number(),
				name: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const catName = input.name.toLocaleLowerCase().trim();
			const result = await ctx.db
				.update(categoriesTable)
				.set({
					name: catName,
					updatedAt: new Date(),
				})
				.where(eq(categoriesTable.id, input.id));

			if (!result) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			logger.info({ categoryId: input.id }, "Updated category");
		}),
	create: adminProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
		const catName = input.toLocaleLowerCase().trim();

		const cat = await ctx.db.query.categoriesTable.findFirst({
			where: (categories, { eq, and, isNull }) =>
				and(eq(categories.name, catName), isNull(categories.deletedAt)),
		});

		if (cat) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Такая категория уже есть",
			});
		}

		await ctx.db.insert(categoriesTable).values({
			name: catName,
			createdAt: new Date(),
		});

		logger.info({ name: catName }, "Created category");
	}),
});
