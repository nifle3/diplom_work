import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";

import * as schema from "./schema";
import { env } from "@diplom_work/env/server";

const client = new PGlite(env.DATABASE_URL);

export const db = drizzle(client, { schema });