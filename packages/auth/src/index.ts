import { db } from "@diplom_work/db";
import { authSchema } from "@diplom_work/db/schema/auth";
import { email } from "@diplom_work/email";
import { env } from "@diplom_work/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: authSchema,
	}),
	trustedOrigins: [env.CORS_ORIGIN],
	emailAndPassword: {
		enabled: true,
		sendResetPassword: async ({ user, url }) => {
			await email.sendPasswordReset({
				to: user.email,
				resetUrl: url,
			});
		},
	},
	plugins: [nextCookies()],
	advanced: {
		database: {
			generateId: () => {
				return crypto.randomUUID();
			},
		},
	},
});
