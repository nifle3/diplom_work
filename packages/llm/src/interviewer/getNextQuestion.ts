import { generateText, Output } from "ai";
import { model } from "../model";
import { generateTemplatePrompt, type Input, outputScheme } from "./utils";

export async function getNextQuestion(input: Input): Promise<string> {
	console.log("getNext question start");
	const { output } = await generateText({
		model: model,
		output: Output.object({
			schema: outputScheme,
		}),
		prompt: generateTemplatePrompt(input),
	});

	console.log("getNext question end");

	return output.content;
}
