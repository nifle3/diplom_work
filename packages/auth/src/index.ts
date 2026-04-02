import { db } from "@diplom_work/db";
import { authSchema } from "@diplom_work/db/schema/auth";

import { email } from "@diplom_work/email";
import { env } from "@diplom_work/env/server";
import { logger } from "@diplom_work/logger/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { customSession } from "better-auth/plugins";
import { createSendResetPassword } from "./logic/email";
import { createLoggerBridge } from "./logic/logger";
import { createSessionHook } from "./logic/session";
import { generateId } from "./logic/utils";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: authSchema,
	}),
	trustedOrigins: [env.CORS_ORIGIN],
	emailAndPassword: {
		enabled: true,
		sendResetPassword: createSendResetPassword({ email, logger }),
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
	plugins: [nextCookies(), customSession(createSessionHook({ db }))],
	advanced: {
		database: {
			generateId: generateId,
		},
	},
	logger: {
		disabled: false,
		disableColors: false,
		level: "warn",
		log: createLoggerBridge({ logger }),
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
