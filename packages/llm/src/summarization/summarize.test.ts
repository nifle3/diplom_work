import { generateText } from "ai";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { summarize } from "./summarize";

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

describe("summarize", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should call generateText with correct parameters and return summarization", async () => {
		const mockOutput = {
			summarization: "This is a summary",
		};
		(generateText as any).mockResolvedValue({
			output: mockOutput,
		});

		const input = {
			humanResponse: "I am a developer",
			aiQuestion: "What is your job?",
			prevSummarization: "User is talking about work",
		};

		const result = await summarize(input);

		expect(generateText).toHaveBeenCalledWith(
			expect.objectContaining({
				messages: expect.arrayContaining([
					expect.objectContaining({
						role: "user",
						content: input.humanResponse,
					}),
				]),
			}),
		);
		expect(result).toBe("This is a summary");
	});
});
