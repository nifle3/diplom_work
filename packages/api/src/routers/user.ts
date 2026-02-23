import { eq } from "drizzle-orm";

import { db } from "@diplom_work/db";
import { usersTable } from "@diplom_work/db/schema/scheme";

import { router, basicAuthProtectedProcedure } from "../index";

export const userRouter = router({
    getStats: basicAuthProtectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.session?.user.id;
        const users = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
        if (!users || users.length === 0) {
            throw new Error("User not found");
        }
        const user = users[0];
        return {
            name: user!.name,
            streak: user!.currentStreak,
        }
    }),
});