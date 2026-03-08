import { z } from "zod";

type Input = {};

const aiOutput = z.object({
	newQuestion: z.string(),
});

type Output = z.infer<typeof aiOutput>;

export async function getNextQuestion(_input: Input): Promise<Output> {
	throw new Error("NOT IMPLEMENTED");
}
