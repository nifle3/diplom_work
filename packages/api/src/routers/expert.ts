import { db } from "@diplom_work/db";
import { categoriesTable, scriptsTable } from "@diplom_work/db/schema/scheme";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure, router } from "..";

export const expertRouter = router({
	getFullScript: protectedProcedure
		.input(z.uuid())
		.query(async ({ input, ctx }) => {
			const data = await db.query.scriptsTable.findFirst({
				where: (scriptsTable, { eq }) => eq(scriptsTable.id, input),
				with: {
					category: true,
					globalCriteria: true,
					questions: true,
				}
			});

			if (!data) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Такого сценария не существует",
				});
			}

			if (data.expertId != ctx.session.user.id) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Вы не создатель этого сценария",
				});
			}

			return data;
		}),
	createNewDraft: protectedProcedure.mutation(async ({ ctx }) => {
		const returningValue = await db
			.insert(scriptsTable)
			.values({
				isDraft: true,
				expertId: ctx.session.user.id,
			})
			.returning();

		const newScript = returningValue[0];
		if (!newScript) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Ошибка сервера, попробуй позже",
				cause: "newScript in createNewDraft is undefined",
			});
		}

		return newScript.id;
	}),
	getMyDrafts: protectedProcedure.query(async ({ ctx }) => {
		const scripts = await db
			.select({
				id: scriptsTable.id,
				title: scriptsTable.title,
				context: scriptsTable.context,
				categoryName: categoriesTable.name,
			})
			.from(scriptsTable)
			.leftJoin(
				categoriesTable,
				eq(scriptsTable.categoryId, categoriesTable.id),
			)
			.where(
				and(
					eq(scriptsTable.expertId, ctx.session.user.id),
					isNull(scriptsTable.deletedAt),
					eq(scriptsTable.isDraft, true),
				),
			)
			.orderBy(desc(scriptsTable.createdAt));

		return scripts;
	}),
	getMyScripts: protectedProcedure.query(async ({ ctx }) => {
		const scripts = await db
			.select({
				id: scriptsTable.id,
				title: scriptsTable.title,
				context: scriptsTable.context,
				categoryName: categoriesTable.name,
			})
			.from(scriptsTable)
			.leftJoin(
				categoriesTable,
				eq(scriptsTable.categoryId, categoriesTable.id),
			)
			.where(
				and(
					eq(scriptsTable.expertId, ctx.session.user.id),
					isNull(scriptsTable.deletedAt),
					eq(scriptsTable.isDraft, false),
				),
			)
			.orderBy(desc(scriptsTable.createdAt));

		return scripts;
	}),
});
