import {
	achievementsTable,
	userAchievementsTable,
} from "@diplom_work/db/schema/scheme";
import { TRPCError } from "@trpc/server";
import { count, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { logger } from "@diplom_work/logger/server";
import { assertAchievementFormulaIsValid } from "../achievements/formula";
import { syncAllUserAchievements } from "../achievements/metrics";
import { adminProcedure, router } from "../init/routers";

const baseAchievementSchema = z.object({
	name: z.string().trim().min(1).max(100),
	description: z.string().trim().min(1).max(2000),
	iconUrl: z.string().trim().max(2048).nullable().optional(),
	formula: z.string().trim().min(1).max(2000),
});

const achievementIdSchema = z.uuid();

async function validateAchievementFormula(formula: string) {
	assertAchievementFormulaIsValid(formula);
}

export const achievementRouter = router({
	getAll: adminProcedure.query(async ({ ctx }) => {
		return ctx.db
			.select({
				id: achievementsTable.id,
				name: achievementsTable.name,
				description: achievementsTable.description,
				iconUrl: achievementsTable.iconUrl,
				formula: achievementsTable.formula,
				createdAt: achievementsTable.createdAt,
				updatedAt: achievementsTable.updatedAt,
				awardedCount: count(userAchievementsTable.achievementId),
			})
			.from(achievementsTable)
			.leftJoin(
				userAchievementsTable,
				eq(userAchievementsTable.achievementId, achievementsTable.id),
			)
			.groupBy(
				achievementsTable.id,
				achievementsTable.name,
				achievementsTable.description,
				achievementsTable.iconUrl,
				achievementsTable.formula,
				achievementsTable.createdAt,
				achievementsTable.updatedAt,
			)
			.orderBy(desc(achievementsTable.createdAt));
	}),
	create: adminProcedure
		.input(baseAchievementSchema)
		.mutation(async ({ input, ctx }) => {
			await validateAchievementFormula(input.formula);

			const [achievement] = await ctx.db
				.insert(achievementsTable)
				.values({
					name: input.name,
					description: input.description,
					iconUrl: input.iconUrl ?? null,
					formula: input.formula,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning({ id: achievementsTable.id });

			if (!achievement) {
				throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
			}

			await syncAllUserAchievements(ctx.db);

			logger.info(
				{ achievementId: achievement.id, name: input.name },
				"Created achievement",
			);

			return achievement;
		}),
	updateById: adminProcedure
		.input(
			baseAchievementSchema.extend({
				id: achievementIdSchema,
			}),
		)
		.mutation(async ({ input, ctx }) => {
			await validateAchievementFormula(input.formula);

			const result = await ctx.db
				.update(achievementsTable)
				.set({
					name: input.name,
					description: input.description,
					iconUrl: input.iconUrl ?? null,
					formula: input.formula,
					updatedAt: new Date(),
				})
				.where(eq(achievementsTable.id, input.id))
				.returning({ id: achievementsTable.id });

			if (!result[0]) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			await syncAllUserAchievements(ctx.db);

			logger.info(
				{ achievementId: result[0].id, name: input.name },
				"Updated achievement",
			);

			return result[0];
		}),
	recalculateAll: adminProcedure.mutation(async ({ ctx }) => {
		const result = await syncAllUserAchievements(ctx.db);
		logger.info("Recalculated all achievements");
		return result;
	}),
});
