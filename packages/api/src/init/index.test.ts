import { describe, expect, it, vi } from "vitest";

vi.mock("node:crypto", () => ({
	randomUUID: vi.fn(() => "generated-request-id"),
}));

vi.mock("./dependencies", () => ({
	defaultDependencies: {
		auth: {
			api: {
				getSession: vi.fn(),
			},
		},
		db: {},
		file: {},
		llm: {},
	},
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
		info: vi.fn(),
		error: vi.fn(),
	},
	loggerStore: {
		run: (_context: unknown, callback: () => unknown) => callback(),
		getStore: () => undefined,
	},
}));

describe("init entrypoint", () => {
	it("re-exports the init helpers", async () => {
		const init = await import("./index");

		expect(init).toEqual(
			expect.objectContaining({
				createContext: expect.any(Function),
				defaultDependencies: expect.any(Object),
				router: expect.any(Function),
				t: expect.any(Object),
			}),
		);
	});
});
