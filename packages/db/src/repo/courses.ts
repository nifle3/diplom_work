import { desc } from "drizzle-orm";

import { db } from "../index";
import { scenariosTable } from "../schema/scheme";

export async function getLatestCourses(limit: number) {
    const query = await db.select().from(scenariosTable).orderBy(desc(scenariosTable.createdAt)).limit(limit);
    return query;
}
