import "dotenv/config";

import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

console.log('AI_TEMPERATURE from process.env:', process.env.AI_TEMPERATURE);
console.log('Type:', typeof process.env.AI_TEMPERATURE);

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().min(1),
		BETTER_AUTH_SECRET: z.string().min(32),
		BETTER_AUTH_URL: z.url(),
		CORS_ORIGIN: z.url(),
		AI_KEY: z.string().min(1),
		AI_TEMPERATURE: z.coerce.number().min(0).max(1).default(0.4),
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
