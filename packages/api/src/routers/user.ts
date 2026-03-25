import { db } from "@diplom_work/db";
import { usersTable } from "@diplom_work/db/schema/scheme";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { protectedProcedure, router } from "../init/routers";

export const userRouter = router({
	getStats: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session?.user.id;
		const users = await db
			.select()
			.from(usersTable)
			.where(eq(usersTable.id, userId))
			.limit(1);
		const { 0: user } = users;

		if (!user) {
			throw new TRPCError({ code: "NOT_FOUND" });
		}

		return {
			name: user?.name,
			streak: user?.currentStreak,
			xp: user?.xp,
		};
	}),
});
