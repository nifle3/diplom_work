import { db } from ".";
import { criteriaTypes } from "./schema/scheme";
import { isNull } from "drizzle-orm";

export interface CriteriaType {
  id: number;
  name: string;
}

export async function getCriteriaTypes(): Promise<CriteriaType[]> {
  const result = await db
    .select({ id: criteriaTypes.id, name: criteriaTypes.name })
    .from(criteriaTypes)
    .where(isNull(criteriaTypes.deletedAt as any))
    .orderBy(criteriaTypes.name);

  return result;
}

export * from "./schema/scheme";
