import { db } from ".";
import { categories } from "./schema/scheme";
import { isNull } from "drizzle-orm";

export interface Category {
  id: string;
  name: string;
}

export async function getCategories(): Promise<Category[]> {
  const result = await db
    .select({
      id: categories.id,
      name: categories.name,
    })
    .from(categories)
    .where(isNull(categories.deletedAt))
    .orderBy(categories.name);

  return result;
}
