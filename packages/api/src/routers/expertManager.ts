import { db } from "@diplom_work/db";
import { usersTable } from "@diplom_work/db/schema/scheme";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { adminProcedure, router } from "..";

const expertId = 2;

export const expertManagerRouter = router({
	getAll: adminProcedure.query(async () => {
		const result = await db.query.usersTable.findMany({
			where: (users, { eq }) => eq(users.roleId, expertId),
			with: {
				role: true,
			},
		});

		return result;
	}),
	setUserExpert: adminProcedure.input(z.email()).mutation(async ({ input }) => {
		const result = await db
			.update(usersTable)
			.set({
				roleId: expertId,
				updatedAt: new Date(),
			})
			.where(and(eq(usersTable.email, input), eq(usersTable.roleId, 1)))
			.returning();

		if (!result) {
			throw new TRPCError({ code: "NOT_FOUND" });
		}
	}),
	unsetUserExpert: adminProcedure
		.input(z.uuid())
		.mutation(async ({ input }) => {
			const result = await db
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
