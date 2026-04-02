import { describe, expect, it, vi } from "vitest";

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
		info: vi.fn(),
		error: vi.fn(),
	},
	loggerStore: {
		run: (_context: unknown, callback: () => unknown) => callback(),
		getStore: () => undefined,
	},
}));

vi.mock("./init", () => ({
	createContext: vi.fn(),
	defaultDependencies: {},
	router: vi.fn(),
	t: {},
}));

describe("package entrypoints", () => {
	it("re-exports the init and router modules", async () => {
		const api = await import("./index");
		const middlewares = await import("./middlewares");

		expect(api).toEqual(
			expect.objectContaining({
				appRouter: expect.any(Object),
			}),
		);
		expect(middlewares).toEqual(
			expect.objectContaining({
				errorMiddleware: expect.any(Object),
			}),
		);
	});
});
