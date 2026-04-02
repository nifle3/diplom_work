import { describe, expect, it } from "vitest";

import { Status, statusToId } from "./sessionStatus";

describe("Status", () => {
	it("exposes the expected enum values", () => {
		expect(Status.active).toBe("active");
		expect(Status.complete).toBe("complete");
		expect(Status.canceled).toBe("canceled");
	});
});

describe("statusToId", () => {
	it("maps every status to its identifier", () => {
		expect(statusToId).toEqual({
			[Status.active]: 1,
			[Status.complete]: 2,
			[Status.canceled]: 3,
		});
	});
});
