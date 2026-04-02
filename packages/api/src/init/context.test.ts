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

import { createContext } from "./context";

describe("createContext", () => {
	it("prefers x-forwarded-for and x-request-id", async () => {
		const getSession = vi.fn().mockResolvedValue({
			user: { id: "user-1" },
			session: { role: "expert" },
		});

		const context = await createContext(
			{
				headers: new Headers({
					"x-forwarded-for": "10.0.0.1, 10.0.0.2",
					"x-request-id": "request-123",
					"user-agent": "vitest",
				}),
			} as never,
			{
				auth: {
					api: {
						getSession,
					},
				} as never,
				db: { name: "db" } as never,
				file: { name: "file" } as never,
				llm: { name: "llm" } as never,
			},
		);

		expect(getSession).toHaveBeenCalledWith({
			headers: {
				"x-forwarded-for": "10.0.0.1, 10.0.0.2",
				"x-request-id": "request-123",
				"user-agent": "vitest",
			},
		});
		expect(context).toEqual({
			session: {
				user: { id: "user-1" },
				session: { role: "expert" },
			},
			requestId: "request-123",
			clientIp: "10.0.0.1",
			userAgent: "vitest",
			setCookieHeaders: [],
			auth: {
				api: {
					getSession,
				},
			},
			db: { name: "db" },
			file: { name: "file" },
			llm: { name: "llm" },
		});
	});

	it("falls back to x-real-ip and generates a request id", async () => {
		const getSession = vi.fn().mockResolvedValue(null);

		const context = await createContext(
			{
				headers: new Headers({
					"x-real-ip": "192.168.0.10",
				}),
			} as never,
			{
				auth: {
					api: {
						getSession,
					},
				} as never,
				db: { name: "db" } as never,
				file: { name: "file" } as never,
				llm: { name: "llm" } as never,
			},
		);

		expect(context.clientIp).toBe("192.168.0.10");
		expect(context.requestId).toBe("generated-request-id");
		expect(context.session).toBeNull();
	});
});
