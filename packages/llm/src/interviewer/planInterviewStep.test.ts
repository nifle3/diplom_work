import { generateText } from "ai";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { planInterviewStep } from "./planInterviewStep";

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

describe("planInterviewStep", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should call generateText with correct parameters", async () => {
		const mockOutput = {
			decision: "next_topic",
			question: "Tell me about your experience with Redux.",
		};
		(generateText as any).mockResolvedValue({
			output: mockOutput,
		});

		const input = {
			context: "Frontend dev role",
			currentTopic: "React",
			currentTopicCriteria: ["Knows hooks"],
			globalCriteria: [{ type: "tech", content: "js" }],
			latestQuestion: "What are hooks?",
			latestAnswer: "They allow using state in functional components.",
			nextTopic: "Redux",
			nextTopicCriteria: ["Store management"],
		};

		const result = await planInterviewStep(input);

		expect(generateText).toHaveBeenCalled();
		expect(result).toEqual(mockOutput);
	});

	it("should handle missing next topic and include summary", async () => {
		const mockOutput = {
			decision: "finish",
			question: "",
		};
		(generateText as any).mockResolvedValue({
			output: mockOutput,
		});

		const input = {
			context: "Frontend dev role",
			currentTopic: "Final thoughts",
			latestQuestion: "Any questions?",
			latestAnswer: "No, thanks.",
			summary: "Session was productive",
		};

		const result = await planInterviewStep(input as any);

		expect(result.decision).toBe("finish");
		expect(generateText).toHaveBeenCalled();
	});
});
