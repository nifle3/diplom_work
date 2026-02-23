import { z } from "zod";
import { desc } from "drizzle-orm";

import { db } from "@diplom_work/db";
import { scenariosTable } from "@diplom_work/db/schema/scheme";

import { basicAuthProtectedProcedure, router } from "../index";


export const getLatestScenariosSchema = z.object({
  limit: z.number().int().min(1).max(20).default(5),
});

export const scenariosRouter = router({
  getLatest: basicAuthProtectedProcedure.input(getLatestScenariosSchema).query(async ({ input }) => {
    const scenarios = await db.select().from(scenariosTable).orderBy(desc(scenariosTable.createdAt)).limit(input.limit);
    
    return scenarios.map((scenario) => ({
      id: scenario.id,
      title: scenario.title,
    }));
  }),
});
