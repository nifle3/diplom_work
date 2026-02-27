import { publicProcedure, router } from "..";
import { activityRouter } from "./activity";
import { expertRouter } from "./expert";
import { mutateScriptRouter } from "./mutateScript";
import { scriptRouter } from "./script";
import { userRouter } from "./user";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	user: userRouter,
	script: scriptRouter,
	activity: activityRouter,
	expert: expertRouter,
	mutateScript: mutateScriptRouter,
});

export type AppRouter = typeof appRouter;
