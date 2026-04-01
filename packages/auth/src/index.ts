import { db } from "@diplom_work/db";
import { authSchema } from "@diplom_work/db/schema/auth";
import { EmailDeliveryError } from "@diplom_work/domain/error";
import { email } from "@diplom_work/email";
import { env } from "@diplom_work/env/server";
import { logger } from "@diplom_work/logger/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { customSession } from "better-auth/plugins";

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
					logger.error(
						{ email: user.email, payload: err.payload },
						"Password reset email delivery failed",
					);
				}
			}
		},
	},
	rateLimit: {
		window: 10,
		max: 100,
	},
	user: {
		changeEmail: {
			enabled: true,
			updateEmailWithoutVerification: true,
		},
	},
	plugins: [
		nextCookies(),
		customSession(async ({ user, session }) => {
			const userWithRole = await db.query.usersTable.findFirst({
				where: (usersTable, { eq }) => eq(usersTable.id, user.id),
				with: {
					role: true,
				},
			});
			return {
				user: user,
				session: {
					...session,
					role: userWithRole?.role.name,
				},
			};
		}),
	],
	advanced: {
		database: {
			generateId: () => {
				return crypto.randomUUID();
			},
		},
	},
	logger: {
		disabled: false,
		disableColors: false,
		level: "warn",
		log: (level, message, ...args) => {
			switch (level) {
				case "error":
					logger.error(`[${level}] ${message}`, ...args);
					break;
				case "warn":
					logger.warn(`[${level}] ${message}`, ...args);
					break;
				case "info":
					logger.info(`[${level}] ${message}`, ...args);
					break;
				case "debug":
					logger.debug(`[${level}] ${message}`, ...args);
					break;
			}
		},
	},
	session: {
		freshAge: 5 * 60,
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60,
			strategy: "jwe",
		},
		additionalFields: {
			role: {
				type: "string",
			},
		},
	},
});
