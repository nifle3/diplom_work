import { usersTable } from "@diplom_work/db/schema/scheme";
import { TRPCError } from "@trpc/server";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { adminProcedure, router } from "../init/routers";

const expertId = 2;

export const expertManagerRouter = router({
	getAll: adminProcedure.query(async ({ ctx }) => {
		const result = await ctx.db.query.usersTable.findMany({
			where: (users, { eq }) => eq(users.roleId, expertId),
			with: {
				role: true,
			},
		});

		return result;
	}),
	setUserExpert: adminProcedure
		.input(z.email())
		.mutation(async ({ input, ctx }) => {
			const user = await ctx.db.query.usersTable.findFirst({
				where: (users, { eq, and, isNull }) =>
					and(isNull(users.deletedAt), eq(users.email, input)),
			});

			if (!user) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Пользователь не найден",
				});
			}

			if (user.roleId === expertId) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Пользователь уже эксперт",
				});
			}

			const result = await ctx.db
				.update(usersTable)
				.set({
					roleId: expertId,
					updatedAt: new Date(),
				})
				.where(
					and(
						eq(usersTable.email, input),
						eq(usersTable.roleId, 1),
						isNull(usersTable.deletedAt),
					),
				)
				.returning();

			if (!result) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Обновление не прошло",
				});
			}
		}),
	unsetUserExpert: adminProcedure
		.input(z.uuid())
		.mutation(async ({ input, ctx }) => {
			const result = await ctx.db
				.update(usersTable)
				.set({
					roleId: 1,
					updatedAt: new Date(),
				})
				.where(eq(usersTable.id, input))
				.returning();

			if (!result) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}
		}),
});
