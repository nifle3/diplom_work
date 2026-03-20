import { Output, generateText } from "ai";
import { z } from "zod";
import { model } from "../model";

const criterionSchema = z.object({
	type: z.string(),
	content: z.string(),
});

const conversationItemSchema = z.object({
	question: z.string(),
	answer: z.string(),
});

const inputSchema = z.discriminatedUnion("mode", [
	z.object({
		mode: z.literal("answer"),
		context: z.string(),
		question: z.string(),
		answer: z.string(),
		globalCriteria: z.array(criterionSchema).default([]),
		specificCriteria: z.array(z.string()).default([]),
		summary: z.string().optional(),
	}),
	z.object({
		mode: z.literal("session"),
		context: z.string(),
		globalCriteria: z.array(criterionSchema).default([]),
		specificCriteria: z.array(z.string()).default([]),
		conversation: z.array(conversationItemSchema).min(1),
		summary: z.string().optional(),
	}),
]);

const outputSchema = z.object({
	score: z.number().int().min(0).max(100),
	feedback: z.string().min(1),
	analysisNote: z.string().min(1),
	strengths: z.array(z.string()).max(3),
	improvements: z.array(z.string()).max(3),
});

export type EvaluateAnswerInput = z.infer<typeof inputSchema>;
export type EvaluateAnswerResult = z.infer<typeof outputSchema>;

function formatCriteria(
	globalCriteria: Array<{ type: string; content: string }>,
	specificCriteria: Array<string>,
) {
	const globalBlock = globalCriteria.length
		? globalCriteria
				.map(
					(criterion, index) =>
						`${index + 1}. [${criterion.type}] ${criterion.content}`,
				)
				.join("\n")
		: "Нет";

	const specificBlock = specificCriteria.length
		? specificCriteria.map((criterion, index) => `${index + 1}. ${criterion}`).join("\n")
		: "Нет";

	return { globalBlock, specificBlock };
}

function buildPrompt(input: EvaluateAnswerInput) {
	const { globalBlock, specificBlock } = formatCriteria(
		input.globalCriteria,
		input.specificCriteria,
	);

	if (input.mode === "answer") {
		return `
Ты оцениваешь ответ кандидата в тренировочном интервью.

Контекст сценария:
${input.context}

Глобальные критерии:
${globalBlock}

Специальные критерии для этого ответа:
${specificBlock}

Вопрос интервьюера:
${input.question}

Ответ кандидата:
${input.answer}

${input.summary ? `Краткое содержание предыдущего общения:\n${input.summary}\n` : ""}

Оцени только этот ответ по шкале от 0 до 100.
Верни:
- score: числовая оценка;
- feedback: 2-4 предложения с развивающей обратной связью;
- analysisNote: 1-2 коротких предложения для хранения рядом с ответом;
- strengths: до 3 сильных сторон;
- improvements: до 3 направлений улучшения.

Учитывай релевантность, конкретику, полноту, логичность и соответствие критериям.
Не придумывай факты, опирайся только на текст ответа.
`;
	}

	const conversationBlock = input.conversation
		.map(
			(item, index) =>
				`${index + 1}. Вопрос: ${item.question}\nОтвет: ${item.answer}`,
		)
		.join("\n\n");

	return `
Ты оцениваешь всю тренировочную интервью-сессию кандидата.

Контекст сценария:
${input.context}

Глобальные критерии:
${globalBlock}

Дополнительные критерии:
${specificBlock}

Диалог интервью:
${conversationBlock}

${input.summary ? `Краткое содержание интервью:\n${input.summary}\n` : ""}

Верни итоговую оценку всей сессии по шкале от 0 до 100.
Верни:
- score: итоговая числовая оценка;
- feedback: 3-6 предложений с итоговой обратной связью по всей сессии;
- analysisNote: 1-2 коротких предложения с общим выводом;
- strengths: до 3 сильных сторон;
- improvements: до 3 направлений улучшения.

Учитывай качество ответов по всей сессии, динамику, полноту и соответствие критериям.
Не придумывай факты и не хвали без оснований.
`;
}

export async function evaluateAnswer(
	rawInput: EvaluateAnswerInput,
): Promise<EvaluateAnswerResult> {
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
