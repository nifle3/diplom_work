import { describe, expect, it } from "vitest";
import { calculateInterviewExperience } from "./sessionExperience";

describe("calculateInterviewExperience", () => {
	it("returns 0 when there is no score", () => {
		expect(calculateInterviewExperience(null)).toBe(0);
	});

	it("returns the score as XP for a completed interview", () => {
		expect(calculateInterviewExperience(0)).toBe(0);
		expect(calculateInterviewExperience(57)).toBe(57);
		expect(calculateInterviewExperience(100)).toBe(100);
	});

	it("never returns a negative value", () => {
		expect(calculateInterviewExperience(-12)).toBe(0);
	});
});
