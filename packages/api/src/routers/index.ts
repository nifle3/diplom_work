import { authRouter } from "./auth";
import { scenariosRouter } from "./scenarios";
import { userRouter } from "./user";
import { interviewRouter } from "./interview";
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
  scenarios: scenariosRouter,
  interview: interviewRouter,
});

export type AppRouter = typeof appRouter;
