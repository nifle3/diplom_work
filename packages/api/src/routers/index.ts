import { authRouter } from "./auth";
import { scenariosRouter } from "./script";
import { userRouter } from "./user";
import { interviewRouter } from "./interview";
import { activityRouter } from "./activity";
import { router, publicProcedure, basicAuthProtectedProcedure } from "..";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: basicAuthProtectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
  auth: authRouter,
  user: userRouter,
  script: scenariosRouter,
  interview: interviewRouter,
  activity: activityRouter,
});

export type AppRouter = typeof appRouter;
