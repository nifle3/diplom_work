import { env } from "@diplom_work/env/server";
import { logger } from "@diplom_work/logger/server";
import { Pool as neonPool } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";
import type { Logger } from "drizzle-orm/logger";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema/scheme";

class DrizzlePinoLogger implements Logger {
	logQuery(query: string, params: unknown[]): void {
		logger.debug({ query, params }, "Drizzle SQL Query");
	}
}

const drizzleLogger =
	env.NODE_ENV === "development" ? new DrizzlePinoLogger() : undefined;

const getDb = () => {
	if (env.DATABASE_PROVIDER === "neon") {
		const client = new neonPool({
			connectionString: env.DATABASE_URL,
		});
		return drizzleNeon(client, {
			schema,
			logger: drizzleLogger,
		});
	}

	const pool = new Pool({ connectionString: env.DATABASE_URL });
	return drizzlePg(pool, {
		schema,
		logger: drizzleLogger,
	});
};

export const db = getDb();

export async function checkDbConnection() {
	try {
		await db.execute(sql`SELECT 1`);
		logger.info({ provider: env.DATABASE_PROVIDER }, "DB connection established");
	} catch (error) {
		if (error instanceof Error) {
			logger.error(
				{ provider: env.DATABASE_PROVIDER, error },
				"DB connection failed",
			);
			throw new Error(`DB Connection failed: ${error.message}`);
		}

		logger.error(
			{ provider: env.DATABASE_PROVIDER, error },
			"DB connection failed",
		);
		throw new Error("DB Connection failed: uknown error");
	}
}
