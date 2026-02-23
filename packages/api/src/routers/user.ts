import { getUserById } from "@diplom_work/db/repo/users";

import { router, basicAuthProtectedProcedure } from "../index";

// Не нравится код потому что мы тут не используем eq а делаем функцю в db репо которая возврашает всё равно то же тип, и выходит так что бы всё равно зависим от drizzle
export const userRouter = router({
    getStats: basicAuthProtectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.session?.user.id;
        const user = await getUserById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        return {
            name: user.name,
            streak: user.currentStreak,
        }
    }),
});