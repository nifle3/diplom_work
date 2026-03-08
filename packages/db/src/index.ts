import { env } from "@diplom_work/env/server";
import { Pool as neonPool } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema/scheme";

const getDb = () => {
	if (env.DATABASE_PROVIDER === "neon") {
		const client = new neonPool({
			connectionString: env.DATABASE_URL
		});
		return drizzleNeon(client, { schema });
	}

	const pool = new Pool({ connectionString: env.DATABASE_URL });
	return drizzlePg(pool, { schema });
};

export const db = getDb();
