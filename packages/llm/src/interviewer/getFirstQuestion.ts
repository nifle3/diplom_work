import { generateText, Output } from "ai";
import { z } from "zod";

import { model } from "../model";

type Input = {
	context: string;
	questionExamples: Array<string>;
};

const outputScheme = z.object({
	content: z.string(),
});

export async function getFirstQuestion(input: Input): Promise<string> {
	const { output } = await generateText({
		model: model,
		output: Output.object({
			schema: outputScheme,
		}),
		prompt: generateTemplatePrompt(input),
	});

	return output.content;
}

function generateTemplatePrompt(input: Input): string {
	const examplesList = input.questionExamples
		.map((q, i) => `${i + 1}. ${q}`)
		.join("\n");

	return `
Ты — профессиональный и эмпатичный интервьюер. Твоя задача — начать интервью, задав первый, открывающий вопрос собеседнику.

### КОНТЕКСТ ИНТЕРВЬЮ:
${input.context}

### ПРИМЕРЫ ВОПРОСОВ (используй их для понимания стиля и уровня сложности):
${examplesList}

### ЗАДАНИЕ:
На основе вышеуказанного контекста, сформулируй ОДИН первый вопрос для начала беседы. 
Вопрос должен быть:
1. Релевантным контексту.
2. Открытым (требующим развернутого ответа).
3. Приветливым, чтобы расположить собеседника к себе.
4. По стилистике похожим на приведенные примеры.
`;
}
