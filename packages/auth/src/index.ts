import { db } from "@diplom_work/db";
import { authSchema } from "@diplom_work/db/schema/auth";
import { EmailDeliveryError } from "@diplom_work/domain/error";
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
			try {
				await email.sendPasswordReset({
					to: user.email,
					resetUrl: url,
				});
			} catch (err: unknown) {
				if (err instanceof EmailDeliveryError) {
					console.error(err.payload?.responseBody);
				}
			}
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
