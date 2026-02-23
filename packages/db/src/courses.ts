import { db } from ".";
import { scenarios, categories, user } from "./schema/scheme";
import { eq, isNull, ilike, sql, and, type SQL } from "drizzle-orm";

export interface CourseWithCategory {
  id: string;
  title: string;
  context: string;
  categoryId: string;
  categoryName: string;
  expertId: string;
  expertName: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getCourses(options: {
  categoryId?: string;
  search?: string;
  limit: number;
  offset: number;
}): Promise<{ courses: CourseWithCategory[]; total: number }> {
  const { categoryId, search, limit, offset } = options;

  // Build where conditions
  const conditions: SQL[] = [isNull(scenarios.deletedAt)];

  if (categoryId) {
    conditions.push(eq(scenarios.categoryId, categoryId));
  }

  if (search && search.trim()) {
    conditions.push(ilike(scenarios.title, `%${search}%`));
  }

  // Build query with filters
  const courses = await db
    .select({
      id: scenarios.id,
      title: scenarios.title,
      context: scenarios.context,
      categoryId: scenarios.categoryId,
      categoryName: categories.name,
      expertId: scenarios.expertId,
      expertName: user.name,
      createdAt: scenarios.createdAt,
      updatedAt: scenarios.updatedAt,
    })
    .from(scenarios)
    .innerJoin(categories, eq(scenarios.categoryId, categories.id))
    .innerJoin(user, eq(scenarios.expertId, user.id))
    .where(and(...conditions))
    .limit(limit)
    .offset(offset);

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(scenarios)
    .innerJoin(categories, eq(scenarios.categoryId, categories.id))
    .innerJoin(user, eq(scenarios.expertId, user.id))
    .where(and(...conditions));

  const total = countResult[0]?.count ?? 0;

  return {
    courses,
    total,
  };
}
