import { generateText, Output } from "ai";
import { model } from "../model";
import { generateTemplatePrompt, type Input, outputScheme } from "./utils";

export async function getNextQuestion(input: Input): Promise<string> {
	const { output } = await generateText({
		model: model,
		output: Output.object({
			schema: outputScheme,
		}),
		prompt: generateTemplatePrompt(input),
	});

	return output.content;
}
