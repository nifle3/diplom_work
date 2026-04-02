import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	globalLimit: vi.fn(),
	llmLimit: vi.fn(),
	loggerInfo: vi.fn(),
	loggerError: vi.fn(),
	loggerStoreRun: vi.fn((_context: unknown, callback: () => unknown) =>
		callback(),
	),
}));

vi.mock("@diplom_work/env/server", () => ({
	env: {
		NODE_ENV: "test",
		RATE_LIMIT_ENABLE: true,
	},
}));

vi.mock("@diplom_work/ratelimit", () => ({
	globalRateLimit: {
		limit: mocks.globalLimit,
	},
	llmRateLimit: {
		limit: mocks.llmLimit,
	},
}));

vi.mock("@diplom_work/logger/server", () => ({
	logger: {
		info: mocks.loggerInfo,
		error: mocks.loggerError,
	},
	loggerStore: {
		run: mocks.loggerStoreRun,
		getStore: () => undefined,
	},
}));

import { TRPCError } from "@trpc/server";
import { t } from "./init/trpc";
import {
	errorMiddleware,
	globalRateLimitMiddleware,
	hasRoleMiddleware,
	loggerMiddleware,
	llmRateLimitMiddleware,
	protectedMiddleware,
} from "./middlewares";

function createCaller(
	middleware: any,
	resolver: (opts: any) => unknown,
	session: unknown = null,
	extraCtx: Record<string, unknown> = {},
) {
	return t.router({
		test: t.procedure.use(middleware).query(resolver),
	}).createCaller({
		requestId: "request-1",
		clientIp: "127.0.0.1",
		userAgent: "vitest",
		session,
		setCookieHeaders: [],
		auth: {} as never,
		db: {} as never,
		file: {} as never,
		llm: {} as never,
		...extraCtx,
	} as never);
}

describe("protectedMiddleware", () => {
	it("rejects unauthenticated callers", async () => {
		const caller = createCaller(protectedMiddleware, () => "ok");

		await expect(caller.test()).rejects.toMatchObject({
			code: "UNAUTHORIZED",
		});
	});

	it("passes the session through", async () => {
		const caller = createCaller(
			protectedMiddleware,
			({ ctx }) => ctx.session.user.id,
			{
				user: {
					id: "user-1",
				},
				session: {
					role: "expert",
				},
			},
		);

		await expect(caller.test()).resolves.toBe("user-1");
	});
});

describe("hasRoleMiddleware", () => {
	it("rejects missing sessions", async () => {
		const caller = createCaller(hasRoleMiddleware("admin"), () => "ok");

		await expect(caller.test()).rejects.toMatchObject({
			code: "UNAUTHORIZED",
		});
	});

	it("rejects users with the wrong role", async () => {
		const caller = createCaller(
			hasRoleMiddleware("admin"),
			() => "ok",
			{
				user: {
					id: "user-1",
				},
				session: {
					role: "expert",
				},
			},
		);

		await expect(caller.test()).rejects.toMatchObject({
			code: "FORBIDDEN",
		});
	});

	it("allows the matching role", async () => {
		const caller = createCaller(
			hasRoleMiddleware("expert"),
			({ ctx }) => ctx.session.session.role,
			{
				user: {
					id: "expert-1",
				},
				session: {
					role: "expert",
				},
			},
		);

		await expect(caller.test()).resolves.toBe("expert");
	});
});

describe("loggerMiddleware", () => {
	it("logs successful procedure calls", async () => {
		const caller = createCaller(
			loggerMiddleware,
			() => "ok",
			{
				user: {
					id: "user-1",
				},
				session: {
					role: "expert",
				},
			},
		);

		await expect(caller.test()).resolves.toBe("ok");
		expect(mocks.loggerInfo).toHaveBeenCalledWith(
			expect.objectContaining({
				path: "test",
				type: "query",
			}),
			"[tRPC] test success",
		);
	});

	it("logs failed procedure calls", async () => {
		const caller = createCaller(
			loggerMiddleware,
			() => {
				throw new Error("boom");
			},
			{
				user: {
					id: "user-1",
				},
				session: {
					role: "expert",
				},
			},
		);

		await expect(caller.test()).rejects.toThrow("boom");
		expect(mocks.loggerError).toHaveBeenCalledWith(
			expect.objectContaining({
				path: "test",
				type: "query",
			}),
			"[tRPC] test error",
		);
	});
});

describe("errorMiddleware", () => {
	it("passes through TRPC errors", async () => {
		const caller = createCaller(errorMiddleware, () => {
			throw new TRPCError({ code: "NOT_FOUND", message: "missing" });
		});

		await expect(caller.test()).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});

	it("maps domain errors to TRPC errors", async () => {
		const caller = createCaller(errorMiddleware, () => {
			const error = new Error("Rate limited") as Error & {
				name: string;
				payload: { reason: string };
			};
			error.name = "EmailDeliveryError";
			error.payload = {
				reason: "rate_limited",
			};
			throw error;
		});

		await expect(caller.test()).rejects.toMatchObject({
			code: "TOO_MANY_REQUESTS",
			message: "Rate limited",
		});
	});

	it("treats non-rate-limited email delivery errors as internal errors", async () => {
		const caller = createCaller(errorMiddleware, () => {
			const error = new Error("Email service down") as Error & {
				name: string;
				payload: { reason: string };
			};
			error.name = "EmailDeliveryError";
			error.payload = {
				reason: "provider_down",
			};
			throw error;
		});

		await expect(caller.test()).rejects.toMatchObject({
			code: "INTERNAL_SERVER_ERROR",
			message: "Email service down",
		});
	});

	it("maps email configuration errors to internal errors", async () => {
		const caller = createCaller(errorMiddleware, () => {
			const error = new Error("Bad email config") as Error & {
				name: string;
				payload: unknown;
			};
			error.name = "EmailConfigurationError";
			error.payload = {};
			throw error;
		});

		await expect(caller.test()).rejects.toMatchObject({
			code: "INTERNAL_SERVER_ERROR",
			message: "Bad email config",
		});
	});

	it("maps generic domain errors to bad requests", async () => {
		const caller = createCaller(errorMiddleware, () => {
			const error = new Error("Invalid data") as Error & {
				name: string;
				payload: unknown;
			};
			error.name = "CustomDomainError";
			error.payload = { some: "payload" };
			throw error;
		});

		await expect(caller.test()).rejects.toMatchObject({
			code: "BAD_REQUEST",
			message: "Invalid data",
		});
	});

	it("maps file and storage errors appropriately", async () => {
		const fileCaller = createCaller(errorMiddleware, () => {
			const error = new Error("Too large") as Error & {
				name: string;
				payload: unknown;
			};
			error.name = "FileTooLarge";
			error.payload = {};
			throw error;
		});

		const storageCaller = createCaller(errorMiddleware, () => {
			const error = new Error("Storage failed") as Error & {
				name: string;
				payload: unknown;
			};
			error.name = "StorageError";
			error.payload = {};
			throw error;
		});

		await expect(fileCaller.test()).rejects.toMatchObject({
			code: "PAYLOAD_TOO_LARGE",
		});
		await expect(storageCaller.test()).rejects.toMatchObject({
			code: "INTERNAL_SERVER_ERROR",
		});
	});
});

describe("rateLimitMiddleware", () => {
	it("uses the session user id when available", async () => {
		mocks.globalLimit.mockResolvedValue({ success: true });
		const caller = createCaller(
			globalRateLimitMiddleware,
			() => "ok",
			{
				user: {
					id: "user-1",
				},
				session: {
					role: "expert",
				},
			},
		);

		await expect(caller.test()).resolves.toBe("ok");
		expect(mocks.globalLimit).toHaveBeenCalledWith("user:user-1:test");
	});

	it("falls back to the client IP, user agent and anonymous identifier", async () => {
		mocks.globalLimit.mockResolvedValue({ success: true });

		await expect(
			createCaller(globalRateLimitMiddleware, () => "ok", null, {
				clientIp: "10.0.0.1",
			}).test(),
		).resolves.toBe("ok");
		await expect(
			createCaller(globalRateLimitMiddleware, () => "ok", null, {
				clientIp: null,
				userAgent: "browser",
			}).test(),
		).resolves.toBe("ok");
		await expect(
			createCaller(globalRateLimitMiddleware, () => "ok", null, {
				clientIp: null,
				userAgent: null,
			}).test(),
		).resolves.toBe("ok");

		expect(mocks.globalLimit).toHaveBeenCalledWith("ip:10.0.0.1:test");
		expect(mocks.globalLimit).toHaveBeenCalledWith("ua:browser:test");
		expect(mocks.globalLimit).toHaveBeenCalledWith("anonymous:test");
	});

	it("throws when the limiter rejects a request", async () => {
		mocks.llmLimit.mockResolvedValue({ success: false });

		const caller = createCaller(
			llmRateLimitMiddleware,
			() => "ok",
			{
				user: {
					id: "user-1",
				},
				session: {
					role: "expert",
				},
			},
		);

		await expect(caller.test()).rejects.toMatchObject({
			code: "TOO_MANY_REQUESTS",
			message: "LLM rate limit exceeded. Please wait a minute and try again.",
		});
	});
});

describe("middleware index", () => {
	it("re-exports the middlewares", async () => {
		const middlewares = await import("./middlewares");
		expect(middlewares).toEqual(
			expect.objectContaining({
				errorMiddleware: expect.any(Object),
				hasRoleMiddleware: expect.any(Function),
				loggerMiddleware: expect.any(Object),
				protectedMiddleware: expect.any(Object),
				globalRateLimitMiddleware: expect.any(Object),
				llmRateLimitMiddleware: expect.any(Object),
				requestIdLoggerMiddleware: expect.any(Object),
			}),
		);
	});
});
