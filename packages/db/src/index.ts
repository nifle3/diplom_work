import { env } from "@diplom_work/env/server";
import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schema";

export const db = drizzle(env.DATABASE_URL, { schema });

export * from "./courses";
export * from "./categories";
export * from "./criteria";
export * from "./interview";
