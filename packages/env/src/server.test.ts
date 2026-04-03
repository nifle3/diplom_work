import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("dotenv/config", () => ({}));

describe("server env configuration", () => {
	beforeEach(() => {
		vi.resetModules();
		vi.unstubAllEnvs();
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	const setupEnv = (envVars: Record<string, string | undefined>) => {
		Object.entries(envVars).forEach(([key, value]) => {
			if (value !== undefined) {
				vi.stubEnv(key, value);
			}
		});
	};

	it("should load and validate correct environment variables", async () => {
		setupEnv({
			DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
			BETTER_AUTH_SECRET: "supersecretkeyatleast32characterslong1234567890",
			BETTER_AUTH_URL: "https://auth.example.com",
			CORS_ORIGIN: "https://myapp.com",
			RESEND_API_KEY: "re_1234567890abcdef",
			EMAIL_FROM: "noreply@example.com",
			AI_KEY: "sk-proj-1234567890abcdef",
			S3_ENDPOINT: "https://s3.example.com",
			S3_REGION: "eu-central-1",
			S3_TENAT_KEY: "tenant-key-123",
			S3_KEY_ID: "AKIAIOSFODNN7EXAMPLE",
			S3_SECRET_KEY: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
			S3_BUCKET: "my-bucket",
			UPSTASH_REDIS_REST_URL: "https://eu1-redis.example.com",
			UPSTASH_REDIS_REST_TOKEN: "upstash-token-123456",
		});

		const { env } = await import("./server");

		expect(env.DATABASE_PROVIDER).toBe("postgres");
		expect(env.AI_TEMPERATURE).toBe(0.4);
		expect(env.RATE_LIMIT_ENABLE).toBe(true);
		expect(env.NODE_ENV).toBe("test");
	});

	it("should use default values", async () => {
		setupEnv({
			DATABASE_URL: "postgresql://localhost:5432/mydb",
			BETTER_AUTH_SECRET: "x".repeat(40),
			BETTER_AUTH_URL: "https://auth.test.com",
			CORS_ORIGIN: "https://test.com",
			RESEND_API_KEY: "re_test123",
			EMAIL_FROM: "hello@test.com",
			AI_KEY: "ai-key-minimal",
			S3_ENDPOINT: "https://s3.test.com",
			S3_REGION: "us-east-1",
			S3_TENAT_KEY: "tenant",
			S3_KEY_ID: "keyid123",
			S3_SECRET_KEY: "secret123",
			S3_BUCKET: "test-bucket",
			UPSTASH_REDIS_REST_URL: "https://redis.test.com",
			UPSTASH_REDIS_REST_TOKEN: "token123",
		});

		const { env } = await import("./server");

		expect(env.DATABASE_PROVIDER).toBe("postgres");
		expect(env.AI_TEMPERATURE).toBe(0.4);
		expect(env.RATE_LIMIT_ENABLE).toBe(true);
		expect(env.NODE_ENV).toBe("test");
	});

	it('should throw "Invalid environment variables" when required variables are missing', async () => {
		await expect(import("./server")).rejects.toThrow(
			"Invalid environment variables",
		);
	});

	it('should throw "Invalid environment variables" if BETTER_AUTH_SECRET is too short', async () => {
		setupEnv({
			DATABASE_URL: "postgresql://localhost/db",
			BETTER_AUTH_SECRET: "too-short-secret",
			BETTER_AUTH_URL: "https://auth.test.com",
			CORS_ORIGIN: "https://test.com",
			RESEND_API_KEY: "re_test",
			EMAIL_FROM: "test@example.com",
			AI_KEY: "ai-key",
			S3_ENDPOINT: "https://s3.test.com",
			S3_REGION: "us-east-1",
			S3_TENAT_KEY: "tenant",
			S3_KEY_ID: "id",
			S3_SECRET_KEY: "secret",
			S3_BUCKET: "bucket",
			UPSTASH_REDIS_REST_URL: "https://redis.test.com",
			UPSTASH_REDIS_REST_TOKEN: "token",
		});

		await expect(import("./server")).rejects.toThrow(
			"Invalid environment variables",
		);
	});

	it("should accept DATABASE_PROVIDER = neon", async () => {
		setupEnv({
			DATABASE_URL: "postgresql://localhost/db",
			DATABASE_PROVIDER: "neon",
			BETTER_AUTH_SECRET: "x".repeat(40),
			BETTER_AUTH_URL: "https://auth.test.com",
			CORS_ORIGIN: "https://test.com",
			RESEND_API_KEY: "re_test",
			EMAIL_FROM: "test@example.com",
			AI_KEY: "ai-key-test",
			S3_ENDPOINT: "https://s3.test.com",
			S3_REGION: "us-east-1",
			S3_TENAT_KEY: "tenant",
			S3_KEY_ID: "id",
			S3_SECRET_KEY: "secret",
			S3_BUCKET: "bucket",
			UPSTASH_REDIS_REST_URL: "https://redis.test.com",
			UPSTASH_REDIS_REST_TOKEN: "token",
		});

		const { env } = await import("./server");
		expect(env.DATABASE_PROVIDER).toBe("neon");
	});

	it("should coerce AI_TEMPERATURE from string to number", async () => {
		setupEnv({
			DATABASE_URL: "postgresql://localhost/db",
			BETTER_AUTH_SECRET: "x".repeat(40),
			BETTER_AUTH_URL: "https://auth.test.com",
			CORS_ORIGIN: "https://test.com",
			RESEND_API_KEY: "re_test",
			EMAIL_FROM: "test@example.com",
			AI_KEY: "ai-key",
			AI_TEMPERATURE: "0.75",
			S3_ENDPOINT: "https://s3.test.com",
			S3_REGION: "us-east-1",
			S3_TENAT_KEY: "tenant",
			S3_KEY_ID: "id",
			S3_SECRET_KEY: "secret",
			S3_BUCKET: "bucket",
			UPSTASH_REDIS_REST_URL: "https://redis.test.com",
			UPSTASH_REDIS_REST_TOKEN: "token",
		});

		const { env } = await import("./server");
		expect(env.AI_TEMPERATURE).toBe(0.75);
	});
});
