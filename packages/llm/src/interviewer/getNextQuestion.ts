import { generateText } from "ai";
import { z } from "zod";

import { model } from "../model";

type Input = {};

const aiOutput = z.object({
	newQuestion: z.string(),
});

type Output = z.infer<typeof aiOutput>;

export async function getNextQuestion(input: Input): Promise<Output> {
	throw new Error("NOT IMPLEMENTED");
}
