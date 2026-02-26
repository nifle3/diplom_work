import { scenariosRouter } from "./script";
import { userRouter } from "./user";
import { activityRouter } from "./activity";
import { router, publicProcedure } from "..";
import { expertRouter } from "./expert";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  user: userRouter,
  script: scenariosRouter,
  activity: activityRouter,
  expert: expertRouter
});

export type AppRouter = typeof appRouter;
