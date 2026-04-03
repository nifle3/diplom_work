import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().min(1),
		DATABASE_PROVIDER: z.enum(["neon", "postgres"]).default("postgres"),
		BETTER_AUTH_SECRET: z
			.string()
			.min(32, { error: "Too small: expected string to have >=32 characters" }),
		BETTER_AUTH_URL: z.url(),
		CORS_ORIGIN: z.url(),
		RESEND_API_KEY: z.string().min(1),
		EMAIL_FROM: z.email(),
		AI_KEY: z.string().min(1),
		AI_TEMPERATURE: z.coerce.number().min(0).max(1).default(0.4),
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
		S3_ENDPOINT: z.url(),
		S3_REGION: z.string(),
		S3_TENAT_KEY: z.string(),
		S3_KEY_ID: z.string(),
		S3_SECRET_KEY: z.string(),
		S3_BUCKET: z.string(),
		UPSTASH_REDIS_REST_URL: z.url(),
		UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
		RATE_LIMIT_ENABLE: z.coerce.boolean().default(true),
	},

	runtimeEnv: process.env,
	emptyStringAsUndefined: true,

	onValidationError: (issues) => {
		console.error("❌ Invalid environment variables:", issues);
		throw new Error("Invalid environment variables");
	},
});
