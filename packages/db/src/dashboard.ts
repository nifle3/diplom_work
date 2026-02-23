import { db } from "../index";
import { user, interviewSessions, scenarios } from "./schema/scheme";
import { desc, eq } from "drizzle-orm";

export async function getDashboardData(userId: string) {
  // Получаем пользователя
  const userRows = await db.select().from(user).where(eq(user.id, userId)).limit(1);
  const userData = userRows[0];
  const name = userData?.name || "Пользователь";
  const streak = userData?.currentStreak || 0;

  // Последняя активность (интервью)
  const activityRows = await db
    .select({
      id: interviewSessions.id,
      title: scenarios.title,
      date: interviewSessions.finishedAt,
    })
    .from(interviewSessions)
    .leftJoin(scenarios, eq(interviewSessions.scenarioId, scenarios.id))
    .where(eq(interviewSessions.userId, userId))
    .orderBy(desc(interviewSessions.finishedAt))
    .limit(5);

  const recentActivity = activityRows
    .filter((a) => a.date)
    .map((a) => ({
      id: a.id,
      title: a.title,
      date: a.date?.toISOString() ?? "",
    }));

  // Последние курсы (сценарии)
  const latestCoursesRows = await db
    .select({ id: scenarios.id, title: scenarios.title })
    .from(scenarios)
    .orderBy(desc(scenarios.createdAt))
    .limit(5);

  const latestCourses = latestCoursesRows.map((c) => ({
    id: c.id,
    title: c.title,
  }));

  return {
    name,
    streak,
    recentActivity,
    latestCourses,
  };
}
