import { authRouter } from "./auth";
import { dashboardRouter } from "./dashboard";
import { coursesRouter } from "./courses";
import { interviewRouter } from "./interview";
import { router, publicProcedure, protectedProcedure } from "..";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
  auth: authRouter,
  dashboard: dashboardRouter,
  courses: coursesRouter,
  interview: interviewRouter,
});

export type AppRouter = typeof appRouter;
