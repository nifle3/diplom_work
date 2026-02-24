import { env } from "@diplom_work/env/server";
import { drizzle } from "drizzle-orm/pglite";

import * as schema from "./schema";

export const db = drizzle(env.DATABASE_URL, { schema });