import { describe, expect, it, vi } from "vitest";
import { createSessionHook } from "./session";

describe("createSessionHook", () => {
	it("should enrich the session with the user's role", async () => {
		const mockDb = {
			query: {
				usersTable: {
					findFirst: vi.fn().mockResolvedValue({
						id: "user-1",
						role: { name: "admin" },
					}),
				},
			},
		};

		const sessionHook = createSessionHook({ db: mockDb as any });

		const user = { id: "user-1", email: "admin@example.com" };
		const session = { id: "session-1", userId: "user-1" };

		const result = await sessionHook({ user, session });

		expect(mockDb.query.usersTable.findFirst).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.any(Function),
				with: { role: true },
			}),
		);

		expect(result).toEqual({
			user,
			session: {
				...session,
				role: "admin",
			},
		});
	});

	it("should handle cases where the user or role is not found", async () => {
		const mockDb = {
			query: {
				usersTable: {
					findFirst: vi.fn().mockResolvedValue(null),
				},
			},
		};

		const sessionHook = createSessionHook({ db: mockDb as any });

		const user = { id: "user-2", email: "user@example.com" };
		const session = { id: "session-2", userId: "user-2" };

		const result = await sessionHook({ user, session });

		expect(result).toEqual({
			user,
			session: {
				...session,
				role: undefined,
			},
		});
	});
});
