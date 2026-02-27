import { env } from "@diplom_work/env/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema/scheme";

const pool = new Pool({
	connectionString: env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
