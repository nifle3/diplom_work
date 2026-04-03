import { describe, expect, it } from "vitest";
import { generateId } from "./utils";

describe("generateId", () => {
	it("should return a valid UUID string", () => {
		const id = generateId();
		expect(typeof id).toBe("string");
		// Simple UUID v4 regex check
		expect(id).toMatch(
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
		);
	});

	it("should generate unique IDs", () => {
		const id1 = generateId();
		const id2 = generateId();
		expect(id1).not.toBe(id2);
	});
});
