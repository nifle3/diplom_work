import { z } from "zod";
import { generateText, Output } from "ai";

import { model } from "../model"; 

type Input = {
    humanResponse: string;
    aiQuestion: string;
    prevSummarization: string;
}

const outputScheme = z.object({
    summarization: z.string(),
});

export async function Summarize(input: Input): Promise<string> {
    const { output } = await generateText({
        model: model,
        output: Output.object({
            schema: outputScheme,
        }),
        messages: [
            {
                role: "system",
                content: "You must summarize all the sentence. I will give you, new ai message, new human message and previous summarize in exactly that order"
            },
            {
                role: "assistant",
                content: input.aiQuestion,
            },
            {
                role: "user",
                content: input.humanResponse,
            },
            {
                role: "assistant",
                content: input.prevSummarization,
            }
        ]
    });

    return output.summarization;
}