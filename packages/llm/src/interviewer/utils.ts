import { z } from "zod";

export const outputScheme = z.object({
	content: z.string(),
});

export type Input = {
	context: string;
	questionExamples: Array<string>;
	summarize?: string;
};

export function generateTemplatePrompt(input: Input): string {
	const examplesList = input.questionExamples
		.map((q, i) => `${i + 1}. ${q}`)
		.join("\n");

	const summaryBlock = input.summarize
		? `### КРАТКОЕ СОДЕРЖАНИЕ ПРЕДЫДУЩЕГО ОБЩЕНИЯ:\n${input.summarize}\n`
		: "";

	return `
Ты — профессиональный и эмпатичный интервьюер. Твоя задача — начать интервью, задав первый, открывающий вопрос собеседнику.

### КОНТЕКСТ ИНТЕРВЬЮ:
${input.context}
${summaryBlock}
### ПРИМЕРЫ ВОПРОСОВ (используй их для понимания стиля и уровня сложности):
${examplesList}

### ЗАДАНИЕ:
На основе вышеуказанного контекста ${input.summarize ? "и краткого содержания " : ""}сформулируй ОДИН первый вопрос для начала беседы. 
Вопрос должен быть:
1. Релевантным контексту.
2. Открытым (требующим развернутого ответа).
3. Приветливым, чтобы расположить собеседника к себе.
4. По стилистике похожим на приведенные примеры.
${input.summarize ? "5. Учитывать информацию из краткого содержания, чтобы не повторяться или логично продолжить тему." : ""}
`;
}
