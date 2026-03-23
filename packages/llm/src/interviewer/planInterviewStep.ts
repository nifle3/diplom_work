import { generateText, Output } from "ai";
import { z } from "zod";
import { model } from "../model";

const criterionSchema = z.object({
	type: z.string(),
	content: z.string(),
});

const inputSchema = z.object({
	context: z.string(),
	summary: z.string().optional(),
	currentTopic: z.string().min(1),
	currentTopicCriteria: z.array(z.string()).default([]),
	globalCriteria: z.array(criterionSchema).default([]),
	latestQuestion: z.string().min(1),
	latestAnswer: z.string().min(1),
	nextTopic: z.string().optional(),
	nextTopicCriteria: z.array(z.string()).default([]),
});

const outputSchema = z.object({
	decision: z.enum(["follow_up", "next_topic", "finish"]),
	question: z.string(),
});

export type PlanInterviewStepInput = z.infer<typeof inputSchema>;
export type PlanInterviewStepResult = z.infer<typeof outputSchema>;

function formatList(items: string[]) {
	return items.length
		? items.map((item, index) => `${index + 1}. ${item}`).join("\n")
		: "None";
}

function formatCriteria(items: Array<{ type: string; content: string }>) {
	return items.length
		? items
				.map((item, index) => `${index + 1}. [${item.type}] ${item.content}`)
				.join("\n")
		: "None";
}

function buildPrompt(input: PlanInterviewStepInput) {
	return `
You are running a structured mock interview.

Your job is to decide the next step after the candidate's latest answer.
You must keep the interview aligned with the scripted topics, but you may ask follow-up questions when the current topic is still incomplete.

Interview context:
${input.context}

Global evaluation criteria:
${formatCriteria(input.globalCriteria)}

Current topic to cover:
${input.currentTopic}

Current topic success signals:
${formatList(input.currentTopicCriteria)}

Latest interviewer question:
${input.latestQuestion}

Latest candidate answer:
${input.latestAnswer}

${input.summary ? `Conversation summary so far:\n${input.summary}\n` : ""}
${input.nextTopic ? `Next topic after this one:\n${input.nextTopic}\n` : "There is no next topic after this one.\n"}
${input.nextTopic ? `Next topic success signals:\n${formatList(input.nextTopicCriteria)}\n` : ""}

Return exactly one decision:
- "follow_up" if the current topic still needs clarification or evidence.
- "next_topic" if the current topic is sufficiently covered and there is another topic to ask next.
- "finish" if the current topic is sufficiently covered and there are no more topics left.

Rules:
- Ask a follow-up only when it is genuinely needed.
- Do not skip to finish while important details for the current topic are still missing.
- If decision is "next_topic", question must ask about the next topic specifically.
- If decision is "follow_up", question must stay on the current topic.
- If decision is "finish", return an empty string in question.
- Keep the question concise, natural, and in the same language as the interview materials.
`;
}

export async function planInterviewStep(
	rawInput: PlanInterviewStepInput,
): Promise<PlanInterviewStepResult> {
	const input = inputSchema.parse(rawInput);

	const { output } = await generateText({
		model,
		output: Output.object({
			schema: outputSchema,
		}),
		prompt: buildPrompt(input),
	});

	return output;
}
