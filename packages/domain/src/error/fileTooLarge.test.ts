import { describe, expect, it } from "vitest";

import { DomainError } from "./base";
import { FileTooLargeError } from "./fileTooLarge";

describe("FileTooLargeError", () => {
	it("sets the class name and payload", () => {
		const error = new FileTooLargeError("File is too large", "10 MB");

		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(DomainError);
		expect(error).toBeInstanceOf(FileTooLargeError);
		expect(error.name).toBe("FileTooLarge");
		expect(error.message).toBe("File is too large");
		expect(error.payload).toBe("10 MB");
		expect(Object.getPrototypeOf(error)).toBe(FileTooLargeError.prototype);
	});
});
