import { generateText } from "ai";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { evaluateAnswer } from "./evaluateAnswer";

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

describe("evaluateAnswer", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should evaluate a single answer mode", async () => {
		const mockOutput = {
			score: 85,
			feedback: "Good answer, but could be more specific.",
			analysisNote: "Solid performance.",
			strengths: ["Clear communication"],
			improvements: ["Add examples"],
		};
		(generateText as any).mockResolvedValue({
			output: mockOutput,
		});

		const input = {
			mode: "answer" as const,
			context: "React interview",
			question: "What is useMemo?",
			answer: "It memoizes values.",
			globalCriteria: [{ type: "technical", content: "Correctness" }],
			specificCriteria: ["Performance optimization"],
		};

		const result = await evaluateAnswer(input);

		expect(generateText).toHaveBeenCalled();
		expect(result).toEqual(mockOutput);
	});

	it("should evaluate session mode", async () => {
		const mockOutput = {
			score: 90,
			feedback: "Great session overall.",
			analysisNote: "Candidate is well-prepared.",
			strengths: ["Consistency"],
			improvements: ["Time management"],
		};
		(generateText as any).mockResolvedValue({
			output: mockOutput,
		});

		const input = {
			mode: "session" as const,
			context: "Frontend interview",
			conversation: [{ question: "How are you?", answer: "Fine, thanks." }],
			globalCriteria: [],
			specificCriteria: [],
		};

		const result = await evaluateAnswer(input);

		expect(generateText).toHaveBeenCalled();
		expect(result).toEqual(mockOutput);
	});
});
