import { env } from "@diplom_work/env/server";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema/scheme";

const getDb = () => {
	if (env.DATABASE_PROVIDER === "neon") {
		return drizzleNeon(neon(env.DATABASE_URL), { schema });
	}

	const pool = new Pool({ connectionString: env.DATABASE_URL });
	return drizzlePg(pool, { schema });
};

export const db = getDb();
