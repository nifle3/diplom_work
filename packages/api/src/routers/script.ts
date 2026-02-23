import { z } from "zod";
import { desc, eq, ilike, isNull, count, and } from "drizzle-orm";

import { db } from "@diplom_work/db";
import { scenariosTable, categoriesTable, usersTable, criteriaTypesTable, scenarioCriteriaTable, questionTemplatesTable } from "@diplom_work/db/schema/scheme";

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
    const scenarios = await db.select().from(scenariosTable).orderBy(desc(scenariosTable.createdAt)).limit(input.limit);
    
    return scenarios.map((scenario) => ({
      id: scenario.id,
      title: scenario.title,
    }));
  }),

  categories: basicAuthProtectedProcedure.query(async () => {
    const categories = await db
      .select({ id: categoriesTable.id, name: categoriesTable.name })
      .from(categoriesTable)
      .where(isNull(categoriesTable.deletedAt));

    return categories;
  }),

  list: basicAuthProtectedProcedure.input(listScenariosSchema).query(async ({ input }) => {
    const { page, limit, categoryId, search } = input;
    const offset = (page - 1) * limit;

    const whereClause = and(
      isNull(scenariosTable.deletedAt),
      categoryId ? eq(scenariosTable.categoryId, categoryId) : undefined,
      search ? ilike(scenariosTable.title, `%${search}%`) : undefined
    );

    const totalResult = await db
      .select({ count: count() })
      .from(scenariosTable)
      .where(whereClause);

    const total = totalResult[0]?.count ?? 0;
    const pages = Math.ceil(total / limit);

    const courses = await db
      .select({
        id: scenariosTable.id,
        title: scenariosTable.title,
        context: scenariosTable.context,
        categoryName: categoriesTable.name,
        expertName: usersTable.name,
      })
      .from(scenariosTable)
      .leftJoin(categoriesTable, eq(scenariosTable.categoryId, categoriesTable.id))
      .leftJoin(usersTable, eq(scenariosTable.expertId, usersTable.id))
      .where(whereClause)
      .orderBy(desc(scenariosTable.createdAt))
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
        id: scenariosTable.id,
        title: scenariosTable.title,
        context: scenariosTable.context,
        categoryName: categoriesTable.name,
      })
      .from(scenariosTable)
      .leftJoin(categoriesTable, eq(scenariosTable.categoryId, categoriesTable.id))
      .where(and(eq(scenariosTable.expertId, ctx.session.user.id), isNull(scenariosTable.deletedAt)))
      .orderBy(desc(scenariosTable.createdAt));

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
      const scenarioResult = await tx.insert(scenariosTable).values({
        title,
        context,
        categoryId,
        expertId: ctx.session.user.id,
      }).returning({ id: scenariosTable.id });

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
