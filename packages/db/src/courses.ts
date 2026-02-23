import { db } from ".";
import { scenarios, categories, user, questionTemplates, scenarioCriteria, criteriaTypes } from "./schema/scheme";
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

export interface CreateCourseInput {
  title: string;
  context: string;
  categoryId: string;
  expertId: string;
}

export interface CreateCourseWithDetailsInput extends CreateCourseInput {
  questions?: string[];
  criteria?: { typeId?: number; content: string }[]; // allow providing typeId per criterion
}

export async function createCourse(input: CreateCourseInput): Promise<CourseWithCategory> {
  const [course] = await db
    .insert(scenarios)
    .values({
      title: input.title,
      context: input.context,
      categoryId: input.categoryId,
      expertId: input.expertId,
    })
    .returning();

  // Получить связанные данные
  const [result] = await db
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
    .where(eq(scenarios.id, course.id));

  return result;
}

export async function createCourseWithDetails(input: CreateCourseWithDetailsInput): Promise<
  CourseWithCategory & { questions: { id: string; text: string }[]; criteria: { id: string; typeId: number; content: string }[] }
> {
  // Use a transaction so that either all inserts succeed or none
  const result = await db.transaction(async (tx) => {
    const [course] = await tx
      .insert(scenarios)
      .values({
        title: input.title,
        context: input.context,
        categoryId: input.categoryId,
        expertId: input.expertId,
      })
      .returning();

    if (input.questions && input.questions.length) {
      const qValues = input.questions.map((text) => ({ scenarioId: course.id, text }));
      await tx.insert(questionTemplates).values(qValues).returning();
    }

    if (input.criteria && input.criteria.length) {
      // For criteria with explicit typeId use it, otherwise fallback to default type 'general'
      const defaultName = "general";
      let defaultTypeId: number | null = null;
      const found = await tx.select({ id: criteriaTypes.id }).from(criteriaTypes).where(eq(criteriaTypes.name, defaultName));
      if (found.length) {
        defaultTypeId = found[0].id;
      } else {
        const [inserted] = await tx.insert(criteriaTypes).values({ name: defaultName }).returning();
        // @ts-ignore
        defaultTypeId = inserted.id;
      }

      const cValues = input.criteria.map((c) => ({ scenarioId: course.id, typeId: c.typeId ?? (defaultTypeId as number), content: c.content }));
      await tx.insert(scenarioCriteria).values(cValues).returning();
    }

    return course;
  });

  // Fetch joined scenario with category and expert info
  const [scenarioRow] = await db
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
    .where(eq(scenarios.id, result.id));

  // Fetch questions and criteria
  const questions = await db
    .select({ id: questionTemplates.id, text: questionTemplates.text })
    .from(questionTemplates)
    .where(eq(questionTemplates.scenarioId, result.id));

  const criteria = await db
    .select({ id: scenarioCriteria.id, typeId: scenarioCriteria.typeId, content: scenarioCriteria.content })
    .from(scenarioCriteria)
    .where(eq(scenarioCriteria.scenarioId, result.id));

  return {
    ...scenarioRow,
    questions: questions.map((q) => ({ id: q.id, text: q.text })),
    criteria: criteria.map((c) => ({ id: c.id, typeId: c.typeId, content: c.content })),
  };
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
