import { z } from "zod";
import { desc, eq, ilike, isNull, count, and } from "drizzle-orm";

import { db } from "@diplom_work/db";
import { scriptsTable, categoriesTable, usersTable, criteriaTypesTable, scenarioCriteriaTable, questionTemplatesTable } from "@diplom_work/db/schema/scheme";

import { basicAuthProtectedProcedure, router } from "../index";


export const getLatestScenariosSchema = z.object({
  limit: z.number().int().min(1).max(20).default(5),
});

export const listScenariosSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(12),
  categoryId: z.string().uuid().optional(),
  search: z.string().optional(),
});

export const createWithDetailsSchema = z.object({
  title: z.string().min(1).max(150),
  context: z.string().min(1),
  categoryId: z.string().uuid(),
  questions: z.array(z.string().min(1)).optional(),
  criteria: z.array(z.object({
    typeId: z.number().optional(),
    content: z.string().min(1),
  })).optional(),
});

export const scenariosRouter = router({
  getLatest: basicAuthProtectedProcedure.input(getLatestScenariosSchema).query(async ({ input }) => {
    const scenarios = await db.select().from(scriptsTable).orderBy(desc(scriptsTable.createdAt)).limit(input.limit);
    
    return scenarios.map((scenario) => ({
      id: scenario.id,
      title: scenario.title,
    }));
  }),

  categories: basicAuthProtectedProcedure.query(async () => {
    const categories = await db
      .select({ id: categoriesTable.id, name: categoriesTable.name })
      .from(categoriesTable);

    return categories;
  }),

  list: basicAuthProtectedProcedure.input(listScenariosSchema).query(async ({ input }) => {
    const { page, limit, categoryId, search } = input;
    const offset = (page - 1) * limit;

    const whereClause = and(
      isNull(scriptsTable.deletedAt),
      categoryId ? eq(scriptsTable.categoryId, categoryId) : undefined,
      search ? ilike(scriptsTable.title, `%${search}%`) : undefined
    );

    const totalResult = await db
      .select({ count: count() })
      .from(scriptsTable)
      .where(whereClause);

    const total = totalResult[0]?.count ?? 0;
    const pages = Math.ceil(total / limit);

    const courses = await db
      .select({
        id: scriptsTable.id,
        title: scriptsTable.title,
        context: scriptsTable.context,
        categoryName: categoriesTable.name,
        expertName: usersTable.name,
      })
      .from(scriptsTable)
      .leftJoin(categoriesTable, eq(scriptsTable.categoryId, categoriesTable.id))
      .leftJoin(usersTable, eq(scriptsTable.expertId, usersTable.id))
      .where(whereClause)
      .orderBy(desc(scriptsTable.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      courses,
      total,
      page,
      pages,
    };
  }),

  getMyScenarios: basicAuthProtectedProcedure.query(async ({ ctx }) => {
    const scenarios = await db
      .select({
        id: scriptsTable.id,
        title: scriptsTable.title,
        context: scriptsTable.context,
        categoryName: categoriesTable.name,
      })
      .from(scriptsTable)
      .leftJoin(categoriesTable, eq(scriptsTable.categoryId, categoriesTable.id))
      .where(and(eq(scriptsTable.expertId, ctx.session.user.id), isNull(scriptsTable.deletedAt)))
      .orderBy(desc(scriptsTable.createdAt));

    return scenarios;
  }),

  criteriaTypes: basicAuthProtectedProcedure.query(async () => {
    const criteriaTypes = await db
      .select({ id: criteriaTypesTable.id, name: criteriaTypesTable.name })
      .from(criteriaTypesTable);

    return criteriaTypes;
  }),

  createWithDetails: basicAuthProtectedProcedure.input(createWithDetailsSchema).mutation(async ({ input, ctx }) => {
    const { title, context, categoryId, questions = [], criteria = [] } = input;

    return await db.transaction(async (tx) => {
      // Insert scenario
      const scenarioResult = await tx.insert(scriptsTable).values({
        title,
        context,
        categoryId,
        expertId: ctx.session.user.id,
      }).returning({ id: scriptsTable.id });

      if (!scenarioResult || scenarioResult.length === 0) {
        throw new Error("Failed to create scenario");
      }

      const scenario = scenarioResult[0]!; // We know it exists from the check above

      // Insert questions if any
      if (questions.length > 0) {
        await tx.insert(questionTemplatesTable).values(
          questions.map(question => ({
            scenarioId: scenario.id,
            text: question,
          }))
        );
      }

      // Insert criteria if any
      if (criteria.length > 0) {
        await tx.insert(scenarioCriteriaTable).values(
          criteria.map(criterion => ({
            scenarioId: scenario.id,
            typeId: criterion.typeId || 1, // Default to first type if not specified
            content: criterion.content,
          }))
        );
      }

      return { id: scenario.id };
    });
  }),
});
