import { publicProcedure, router } from "..";
import { activityRouter } from "./activity";
import { expertRouter } from "./expert";
import { mutateScriptRouter } from "./mutateScript";
import { profileRouter } from "./profile";
import { scriptRouter } from "./script";
import { sessionRouter } from "./session";
import { userRouter } from "./user";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	user: userRouter,
	script: scriptRouter,
	activity: activityRouter,
	expert: expertRouter,
	createScript: mutateScriptRouter,
	profile: profileRouter,
	session: sessionRouter,
});

export type AppRouter = typeof appRouter;
