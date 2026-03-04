import { ChatPromptTemplate } from "langchain/prompts";
import { model } from "../model/model";

const interviewPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `
Ты технический интервьюер.
Используй критерии эксперта как ориентир.
Задавай вариативные вопросы.
Не оценивай кандидата.
`
  ],
  [
    "human",
    `
Критерии:
{criteria}

Предыдущие вопросы и ответы:
{history}

Сформулируй следующий вопрос.
`
  ],
]);

export async function generateNextQuestion(input: {
    criteria: string;
    history: string;
}) {
    const chain = interviewPrompt.pipe(model);

    const response = await chain.invoke({
        criteria: input.criteria,
        history: input.history,
    });

    return response.content;
}