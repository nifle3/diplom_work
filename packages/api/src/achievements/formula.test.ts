import { describe, expect, it } from "vitest";
import {
	assertAchievementFormulaIsValid,
	evaluateAchievementFormula,
} from "./formula";

const context = {
	xp: 1200,
	streak: 7,
	interviewCount: 11,
	completedInterviews: 10,
	canceledInterviews: 1,
	averageScore: 84.5,
	bestScore: 100,
	lastScore: 91,
	achievementCount: 3,
	interviewsToday: 2,
	completedToday: 1,
	daysSinceLastInterview: 0,
	daysSinceLastCompletedInterview: 0,
} as const;

describe("achievement formula", () => {
	it("evaluates boolean expressions", () => {
		expect(
			evaluateAchievementFormula(
				"xp >= 1000 && streak >= 7 && completedInterviews >= 10",
				context,
			),
		).toBe(true);
	});

	it("supports arithmetic and parenthesis", () => {
		expect(
			evaluateAchievementFormula(
				"(xp / 100) >= 12 && bestScore == 100",
				context,
			),
		).toBe(true);
	});

	it("rejects unknown variables", () => {
		expect(() =>
			assertAchievementFormulaIsValid("unknownMetric >= 1"),
		).toThrowError(/Unknown formula variables/);
	});
});
