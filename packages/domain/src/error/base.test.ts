import { describe, expect, it } from "vitest";

import { DomainError } from "./base";

describe("DomainError", () => {
	it("keeps the message, payload, and prototype chain", () => {
		const payload = { reason: "missing" };
		const error = new DomainError("Something went wrong", payload);

		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(DomainError);
		expect(error.message).toBe("Something went wrong");
		expect(error.payload).toBe(payload);
		expect(Object.getPrototypeOf(error)).toBe(DomainError.prototype);
	});
});
