import { publicProcedure, router } from "../init/routers";
import { activityRouter } from "./activity";
import { categoryRouter } from "./category";
import { expertRouter } from "./expert";
import { expertManagerRouter } from "./expertManager";
import { fileRouter } from "./file";
import { mutateScriptRouter } from "./mutateScript";
import { profileRouter } from "./profile";
import { reportRouter } from "./report";
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
	report: reportRouter,
	profile: profileRouter,
	session: sessionRouter,
	category: categoryRouter,
	expertManager: expertManagerRouter,
	file: fileRouter,
});

export type AppRouter = typeof appRouter;
