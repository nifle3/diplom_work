import { z } from "zod";
import { desc, eq, ilike, isNull, count, and } from "drizzle-orm";

import { db } from "@diplom_work/db";
import { scenariosTable, categoriesTable, usersTable } from "@diplom_work/db/schema/scheme";

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
});
