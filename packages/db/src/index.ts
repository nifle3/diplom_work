import { env } from "@diplom_work/env/server";
import * as schema from "./schema/scheme";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const getDb = () => {
  if (env.DATABASE_PROVIDER === "neon") {
    return drizzleNeon(neon(env.DATABASE_URL), { schema });
  }
  
  const pool = new Pool({ connectionString: env.DATABASE_URL });
  return drizzlePg(pool, { schema });
};

export const db = getDb();