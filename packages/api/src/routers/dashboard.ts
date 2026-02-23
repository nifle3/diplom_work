import { publicProcedure, protectedProcedure, router } from "./trpc";
import { z } from "zod";

import { getDashboardData } from "@diplom_work/db/dashboard";

// Типы для recentActivity и latestCourses
const RecentActivitySchema = z.object({
  id: z.string(),
  title: z.string(),
  date: z.string(), // ISO string
});

const CourseSchema = z.object({
  id: z.string(),
  title: z.string(),
});

export const dashboardRouter = router({
  getDashboard: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    return getDashboardData(userId);
  }),
});
