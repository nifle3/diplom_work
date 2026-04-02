import { describe, expect, it } from "vitest";

import { reportStatuses } from "./reportStatus";

describe("reportStatuses", () => {
	it("exposes the expected allowed statuses", () => {
		expect(reportStatuses).toEqual([
			"new",
			"in_review",
			"resolved",
			"rejected",
		]);
	});
});
