import { generateText, Output } from "ai";
import { z } from "zod";

import { model } from "../model";

type Input = {
	humanResponse: string;
	aiQuestion: string;
	prevSummarization: string;
};

const outputScheme = z.object({
	summarization: z.string(),
});

export async function summarize(input: Input): Promise<string> {
	const { output } = await generateText({
		model: model,
		output: Output.object({
			schema: outputScheme,
		}),
		messages: [
			{
				role: "system",
				content:
					"You must summarize all the sentence. I will give you, new ai message, previous summarize and new human message in exactly that order",
			},
			{
				role: "assistant",
				content: input.aiQuestion,
			},
			{
				role: "assistant",
				content: input.prevSummarization,
			},
			{
				role: "user",
				content: input.humanResponse,
			},
		],
	});

	return output.summarization;
}
