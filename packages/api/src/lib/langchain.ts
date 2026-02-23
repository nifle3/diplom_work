import { ChatMistralAI } from "@langchain/mistralai";
import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } from "@langchain/core/prompts";
import { ConversationBufferMemory } from "langchain/memory";
import { LLMChain } from "langchain/chains";
import { env } from "@diplom_work/env/server";

interface ScenarioContext {
  scenarioTitle: string;
  scenarioContext: string;
  globalCriteria: string;
  questionList: string;
}

/**
 * Генерирует системный промпт для интервью на основе контекста сценария
 */
export function generateInterviewSystemPrompt(scenario: ScenarioContext): string {
  return `Ты — опытный интервьюер проводящий собеседование по теме: "${scenario.scenarioTitle}".

Контекст интервью:
${scenario.scenarioContext}

Критерии оценки ответов:
${scenario.globalCriteria}

Примеры вопросов, которые может быть целесообразно использовать:
${scenario.questionList}

Твои обязанности:
1. Задавай вопросы по теме, имитируя реальное собеседование
2. Анализируй каждый ответ кандидата на предмет соответствия критериям
3. После каждого ответа предоставляй краткую обратную связь (в одной строке после "FEEDBACK:")
4. Постепенно переходи к более сложным вопросам
5. Если ответ содержит ошибки или упущения, указывай на них конструктивно

Формат твоего ответа:
[Твой вопрос или комментарий]
FEEDBACK: [Краткий анализ предыдущего ответа, если это не первое сообщение]
SCORE: [Оценка от 1-10, если это не первое сообщение]`;
}

/**
 * Создает LLM для интервью (Mistral по умолчанию)
 */
export function createInterviewLLM(modelName: string = "mistral-large-latest"): ChatMistralAI {
  return new ChatMistralAI({
    apiKey: env.MISTRAL_API_KEY,
    modelName,
    temperature: 0.7,
    maxTokens: 1024,
  });
}

/**
 * Создает памятью буфер для диалога
 */
export function createMemory(): ConversationBufferMemory {
  return new ConversationBufferMemory({
    memoryKey: "chat_history",
    inputKey: "input",
    outputKey: "output",
    returnMessages: true,
  });
}

/**
 * Создает LLMChain для интервью с памятью
 */
export async function createInterviewChain(systemPrompt: string, llm?: ChatMistralAI) {
  const model = llm || createInterviewLLM();
  const memory = createMemory();

  const chatPrompt = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(systemPrompt),
    new HumanMessagePromptTemplate({
      prompt: ChatPromptTemplate.fromTemplate("{input}"),
    }),
  ]);

  const chain = new LLMChain({
    llm: model,
    prompt: chatPrompt,
    memory,
    verbose: false,
  });

  return { chain, memory };
}

/**
 * Парсит ответ AI для извлечения feedback и score
 */
export function parseAIResponse(response: string): {
  message: string;
  feedback?: string;
  score?: number;
} {
  const feedbackMatch = response.match(/FEEDBACK:\s*(.+?)(?=\nSCORE:|$)/s);
  const scoreMatch = response.match(/SCORE:\s*(\d+)/);

  const feedback = feedbackMatch ? feedbackMatch[1].trim() : undefined;
  const score = scoreMatch ? parseInt(scoreMatch[1], 10) : undefined;

  // Удаляем FEEDBACK и SCORE из основного сообщения
  const message = response
    .replace(/FEEDBACK:.*?(?=\nSCORE:|$)/s, "")
    .replace(/SCORE:.*$/s, "")
    .trim();

  return {
    message,
    feedback,
    score,
  };
}
