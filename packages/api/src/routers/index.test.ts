import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	loggerInfo: vi.fn(),
	loggerError: vi.fn(),
}));

vi.mock("@diplom_work/env/server", () => ({
	env: {
		NODE_ENV: "test",
		RATE_LIMIT_ENABLE: false,
	},
}));

vi.mock("@diplom_work/ratelimit", () => ({
	globalRateLimit: {
		limit: vi.fn(),
	},
	llmRateLimit: {
		limit: vi.fn(),
	},
}));

vi.mock("@diplom_work/logger/server", () => ({
	logger: {
		info: mocks.loggerInfo,
		error: mocks.loggerError,
	},
	loggerStore: {
		run: (_context: unknown, callback: () => unknown) => callback(),
		getStore: () => undefined,
	},
}));

import { appRouter } from "./index";

describe("appRouter.healthCheck", () => {
	it("returns OK", async () => {
		const caller = appRouter.createCaller({
			requestId: "req-1",
			clientIp: "127.0.0.1",
			userAgent: "vitest",
			session: null,
			setCookieHeaders: [],
			auth: {} as never,
			db: {} as never,
			file: {} as never,
			llm: {} as never,
		} as never);

		await expect(caller.healthCheck()).resolves.toBe("OK");
	});
});
