import { describe, expect, it } from "vitest";

import { DomainError } from "./base";
import { StorageError } from "./storage";

describe("StorageError", () => {
	it("sets the class name and payload", () => {
		const payload = {
			what: "uploading a file",
			who: "s3" as const,
		};
		const error = new StorageError("Storage failed", payload);

		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(DomainError);
		expect(error).toBeInstanceOf(StorageError);
		expect(error.name).toBe("StorageError");
		expect(error.message).toBe("Storage failed");
		expect(error.payload).toEqual(payload);
		expect(Object.getPrototypeOf(error)).toBe(StorageError.prototype);
	});
});
