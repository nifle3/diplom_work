
import { protectedProcedure, publicProcedure, router } from "../index";
import { authRouter } from "./auth";
import { dashboardRouter } from "./dashboard";
import { coursesRouter } from "./courses";

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
});
export type AppRouter = typeof appRouter;
