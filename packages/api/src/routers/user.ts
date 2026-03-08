import { db } from "@diplom_work/db";
import { usersTable } from "@diplom_work/db/schema/scheme";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../index";

const roleNameCheckInput = z.enum(["admin", "expert"]);
const roleNameToRoleId = {
	user: 1,
	expert: 2,
	admin: 3,
};

export const userRouter = router({
	getStats: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session?.user.id;
		const users = await db
			.select()
			.from(usersTable)
			.where(eq(usersTable.id, userId))
			.limit(1);
		if (!users || users.length === 0) {
			throw new Error("User not found");
		}
		const user = users[0];
		return {
			name: user?.name,
			streak: user?.currentStreak,
			xp: user?.xp,
		};
	}),
	isUserHasRole: protectedProcedure
		.input(roleNameCheckInput)
		.query(async ({ input, ctx }) => {
			const user = await db.query.usersTable.findFirst({
				where: (usersTable, { eq }) => eq(usersTable.id, ctx.session.user.id),
				columns: {
					roleId: true,
				},
			});

			if (!user) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}

			const requiredRole = roleNameToRoleId[input];
			console.debug(`finded role ${requiredRole}, userRole ${user.roleId}`);

			return user && user.roleId === requiredRole;
		}),
});
