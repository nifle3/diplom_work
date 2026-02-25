import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schema";
import { env } from "@diplom_work/env/server";


export const db = drizzle(env.DATABASE_URL, { schema });
