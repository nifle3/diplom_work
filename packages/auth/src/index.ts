import { db } from "@diplom_work/db";
import * as schema from "@diplom_work/db/schema/auth";
import { roles } from "@diplom_work/db/schema/auth";
import { env } from "@diplom_work/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { BASE_ERROR_CODES } from "@better-auth/core/error";
import { APIError } from "better-call";
import { eq } from "drizzle-orm";

const DEFAULT_USER_ROLE = "user";
let defaultUserRoleId: number | null = null;

async function resolveDefaultRoleId() {
  if (defaultUserRoleId) {
    return defaultUserRoleId;
  }
  const foundRole = await db
    .select({ id: roles.id })
    .from(roles)
    .where(eq(roles.name, DEFAULT_USER_ROLE));
  if (!foundRole.length) {
    throw new APIError("INTERNAL_SERVER_ERROR", {
      message: BASE_ERROR_CODES.FAILED_TO_CREATE_USER,
    });
  }
  defaultUserRoleId = foundRole[0].id;
  return defaultUserRoleId;
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",

    schema: schema,
  }),
  trustedOrigins: [env.CORS_ORIGIN],
  emailAndPassword: {
    enabled: true,
  },
  databaseHooks: {
    user: {
      create: {
        before: async (data) => {
          if (data.roleId) return { data };
          const roleId = await resolveDefaultRoleId();
          return { data: { ...data, roleId } };
        },
      },
    },
  },
  plugins: [nextCookies()],
});
