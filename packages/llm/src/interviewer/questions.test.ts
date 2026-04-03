import { generateText } from "ai";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getFirstQuestion } from "./getFirstQuestion";
import { getNextQuestion } from "./getNextQuestion";

vi.mock("../model", () => ({
	model: {},
}));

vi.mock("ai", async (importOriginal) => {
	const original = (await importOriginal()) as any;
	return {
		...original,
		generateText: vi.fn(),
	};
});

describe("Interviewer Questions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const mockInput = {
		context: "Test context",
		questionExamples: ["Example 1"],
	};

	it("getFirstQuestion should return generated text", async () => {
		(generateText as any).mockResolvedValue({
			output: { content: "First question?" },
		});

		const result = await getFirstQuestion(mockInput);
		expect(result).toBe("First question?");
		expect(generateText).toHaveBeenCalled();
	});

	it("getNextQuestion should return generated text", async () => {
		(generateText as any).mockResolvedValue({
			output: { content: "Next question?" },
		});

		const result = await getNextQuestion(mockInput);
		expect(result).toBe("Next question?");
		expect(generateText).toHaveBeenCalled();
	});
});
