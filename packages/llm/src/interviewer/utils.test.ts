import { describe, it, expect } from "vitest";
import { generateTemplatePrompt } from "./utils";

describe("generateTemplatePrompt", () => {
	it("should generate prompt without summary", () => {
		const input = {
			context: "React interview",
			questionExamples: ["What is JSX?", "How does virtual DOM work?"],
		};

		const prompt = generateTemplatePrompt(input);

		expect(prompt).toContain("React interview");
		expect(prompt).toContain("1. What is JSX?");
		expect(prompt).not.toContain("КРАТКОЕ СОДЕРЖАНИЕ");
	});

	it("should generate prompt with summary", () => {
		const input = {
			context: "React interview",
			questionExamples: ["What is JSX?"],
			summarize: "User knows basics",
		};

		const prompt = generateTemplatePrompt(input);

		expect(prompt).toContain("React interview");
		expect(prompt).toContain("КРАТКОЕ СОДЕРЖАНИЕ");
		expect(prompt).toContain("User knows basics");
	});
});
