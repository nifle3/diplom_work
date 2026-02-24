import { authRouter } from "./auth";
import { scenariosRouter } from "./script";
import { userRouter } from "./user";
import { activityRouter } from "./activity";
import { router, publicProcedure } from "..";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  auth: authRouter,
  user: userRouter,
  script: scenariosRouter,
  activity: activityRouter,
});

export type AppRouter = typeof appRouter;
