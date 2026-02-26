import { scenariosRouter } from "./script";
import { userRouter } from "./user";
import { activityRouter } from "./activity";
import { router, publicProcedure } from "..";
import { expertRouter } from "./expert";
import { mutateScriptRouter } from "./mutateScript";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  user: userRouter,
  script: scenariosRouter,
  activity: activityRouter,
  expert: expertRouter,
  mutateScript: mutateScriptRouter
});

export type AppRouter = typeof appRouter;
