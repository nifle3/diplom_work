import { z } from "zod";
import { protectedProcedure, router } from "../index";
import {
  getScenarioWithDetails,
  createInterviewSession,
  getInterviewSession,
  saveChatMessage,
  getSessionChatHistory,
  completeInterviewSession,
  updateUserProgressOnSessionComplete,
  getFirstQuestion,
  getSessionResults,
} from "@diplom_work/db";
import {
  generateInterviewSystemPrompt,
  createInterviewLLM,
  createInterviewChain,
  parseAIResponse,
} from "../lib/langchain";
import { calculateFinalScoreFromMessages, extractAllFeedbacks } from "../lib/score-parser";

const sessionChains = new Map<
  string,
  {
    chain: any;
    memory: any;
    messages: Array<{ role: "user" | "assistant"; content: string }>;
  }
>();

const startSessionSchema = z.object({
  scenarioId: z.string().uuid(),
});

const submitAnswerSchema = z.object({
  sessionId: z.string().uuid(),
  answer: z.string().min(1).max(5000),
});

const endSessionSchema = z.object({
  sessionId: z.string().uuid(),
});

const getSessionHistorySchema = z.object({
  sessionId: z.string().uuid(),
});

const getSessionResultsSchema = z.object({
  sessionId: z.string().uuid(),
});

export const interviewRouter = router({
  /**
   * Начать новую сессию интервью
   */
  startSession: protectedProcedure
    .input(startSessionSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.user) {
        throw new Error("Требуется авторизация");
      }

      try {
        // Получить сценарий с полным контекстом
        const scenarioData = await getScenarioWithDetails(input.scenarioId);

        // Создать сессию в БД
        const session = await createInterviewSession(ctx.session.user.id, input.scenarioId);

        // Сформировать системный промпт
        const globalCriteriaText = scenarioData.globalCriteria
          .map((c) => `• ${c.content}`)
          .join("\n");

        const questionListText = scenarioData.questions
          .map((q) => `• ${q.text}`)
          .join("\n");

        const systemPrompt = generateInterviewSystemPrompt({
          scenarioTitle: scenarioData.scenario.title,
          scenarioContext: scenarioData.scenario.context,
          globalCriteria: globalCriteriaText || "Нет дополнительных критериев",
          questionList: questionListText || "Вопросы генерируются ИИ",
        });

        // Создать LLM цепочку с памятью
        const llm = createInterviewLLM();
        const { chain, memory } = await createInterviewChain(systemPrompt, llm);

        // Получить первый вопрос
        const firstQuestion = await getFirstQuestion(input.scenarioId);

        // Запустить цепочку с первым вопросом
        const aiResponse = await chain.call({
          input: firstQuestion,
        });

        const parsedResponse = parseAIResponse(aiResponse.text || "");

        // Сохранить сообщения в БД
        await saveChatMessage(session.id, false, firstQuestion);
        await saveChatMessage(session.id, true, parsedResponse.message, parsedResponse.feedback);

        // Сохранить цепочку в памяти
        sessionChains.set(session.id, {
          chain,
          memory,
          messages: [
            { role: "user", content: firstQuestion },
            { role: "assistant", content: parsedResponse.message },
          ],
        });

        return {
          sessionId: session.id,
          scenarioTitle: scenarioData.scenario.title,
          firstMessage: parsedResponse.message,
          feedback: parsedResponse.feedback,
        };
      } catch (error) {
        console.error("Error starting interview session:", error);
        throw new Error(`Ошибка при запуске сессии: ${error instanceof Error ? error.message : "неизвестная ошибка"}`);
      }
    }),

  /**
   * Отправить ответ на вопрос интервьюера
   */
  submitAnswer: protectedProcedure
    .input(submitAnswerSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.user) {
        throw new Error("Требуется авторизация");
      }

      try {
        const session = await getInterviewSession(input.sessionId);

        if (!session) {
          throw new Error(`Сессия ${input.sessionId} не найдена`);
        }

        if (session.userId !== ctx.session.user.id) {
          throw new Error("Доступ запрещен");
        }

        if (session.status !== "active") {
          throw new Error("Сессия завершена");
        }

        // Получить или создать цепочку
        let chainData = sessionChains.get(input.sessionId);

        if (!chainData) {
          // Восстановить цепочку из БД
          const scenarioData = await getScenarioWithDetails(session.scenarioId);

          const globalCriteriaText = scenarioData.globalCriteria
            .map((c) => `• ${c.content}`)
            .join("\n");

          const questionListText = scenarioData.questions
            .map((q) => `• ${q.text}`)
            .join("\n");

          const systemPrompt = generateInterviewSystemPrompt({
            scenarioTitle: scenarioData.scenario.title,
            scenarioContext: scenarioData.scenario.context,
            globalCriteria: globalCriteriaText || "Нет дополнительных критериев",
            questionList: questionListText || "Вопросы генерируются ИИ",
          });

          const llm = createInterviewLLM();
          const { chain, memory } = await createInterviewChain(systemPrompt, llm);

          // Загрузить историю в память
          const history = await getSessionChatHistory(input.sessionId);
          for (const msg of history) {
            if (msg.isAi) {
              await memory.saveContext({ input: "" }, { output: msg.messageText });
            } else {
              await memory.saveContext({ input: msg.messageText }, { output: "" });
            }
          }

          chainData = {
            chain,
            memory,
            messages: history.map((msg) => ({
              role: msg.isAi ? ("assistant" as const) : ("user" as const),
              content: msg.messageText,
            })),
          };
        }

        // Получить ответ от AI
        const aiResponse = await chainData.chain.call({
          input: input.answer,
        });

        const parsedResponse = parseAIResponse(aiResponse.text || "");

        // Сохранить оба сообщения в БД
        await saveChatMessage(input.sessionId, false, input.answer);
        await saveChatMessage(input.sessionId, true, parsedResponse.message, parsedResponse.feedback);

        // Обновить сообщения в памяти
        chainData.messages.push(
          { role: "user", content: input.answer },
          { role: "assistant", content: parsedResponse.message }
        );

        // Обновить в памяти
        sessionChains.set(input.sessionId, chainData);

        return {
          sessionId: input.sessionId,
          aiResponse: parsedResponse.message,
          feedback: parsedResponse.feedback,
          score: parsedResponse.score,
          messageCount: chainData.messages.length,
        };
      } catch (error) {
        console.error("Error submitting answer:", error);
        throw new Error(`Ошибка при обработке ответа: ${error instanceof Error ? error.message : "неизвестная ошибка"}`);
      }
    }),

  /**
   * Завершить сессию интервью
   */
  endSession: protectedProcedure
    .input(endSessionSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.user) {
        throw new Error("Требуется авторизация");
      }

      try {
        const session = await getInterviewSession(input.sessionId);

        if (!session) {
          throw new Error(`Сессия ${input.sessionId} не найдена`);
        }

        if (session.userId !== ctx.session.user.id) {
          throw new Error("Доступ запрещен");
        }

        // Получить историю сессии
        const messages = await getSessionChatHistory(input.sessionId);

        // Подсчитать финальный скор на основе feedback
        let totalScore = 0;
        let scoreCount = 0;
        for (const msg of messages) {
          if (msg.analysisNote && msg.analysisNote.includes("SCORE:")) {
            const scoreMatch = msg.analysisNote.match(/SCORE:\s*(\d+)/);
            if (scoreMatch) {
              totalScore += parseInt(scoreMatch[1], 10);
              scoreCount++;
            }
          }
        }

        const finalScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 5;

        // Завершить сессию
        const completedSession = await completeInterviewSession(
          input.sessionId,
          finalScore,
          `Интервью завершено. Финальная оценка: ${finalScore}/10. Всего вопросов: ${Math.ceil((messages.length - 1) / 2)}.`
        );

        // Обновить XP и streak пользователя
        const xpGain = Math.max(10, finalScore * 10); // Минимум 10 XP
        const progress = await updateUserProgressOnSessionComplete(
          ctx.session.user.id,
          xpGain,
          finalScore
        );

        // Очистить память сессии
        sessionChains.delete(input.sessionId);

        return {
          sessionId: input.sessionId,
          finalScore,
          xpGained: progress.xpGained,
          newXp: progress.newXp,
          newStreak: progress.newStreak,
          messageCount: messages.length,
        };
      } catch (error) {
        console.error("Error ending session:", error);
        throw new Error(`Ошибка при завершении сессии: ${error instanceof Error ? error.message : "неизвестная ошибка"}`);
      }
    }),

  /**
   * Получить историю чата сессии
   */
  getSessionHistory: protectedProcedure
    .input(getSessionHistorySchema)
    .query(async ({ input, ctx }) => {
      if (!ctx.session?.user) {
        throw new Error("Требуется авторизация");
      }

      try {
        const session = await getInterviewSession(input.sessionId);

        if (!session) {
          throw new Error(`Сессия ${input.sessionId} не найдена`);
        }

        if (session.userId !== ctx.session.user.id) {
          throw new Error("Доступ запрещен");
        }

        const messages = await getSessionChatHistory(input.sessionId);

        return {
          sessionId: input.sessionId,
          status: session.status,
          finalScore: session.finalScore,
          messages: messages.map((msg) => ({
            id: msg.id,
            isAi: msg.isAi,
            content: msg.messageText,
            feedback: msg.analysisNote,
            createdAt: msg.createdAt,
          })),
        };
      } catch (error) {
        console.error("Error getting session history:", error);
        throw new Error(`Ошибка при получении истории: ${error instanceof Error ? error.message : "неизвестная ошибка"}`);
      }
    }),

  /**
   * Получить результаты завершенной сессии интервью
   */
  getResults: protectedProcedure
    .input(getSessionResultsSchema)
    .query(async ({ input, ctx }) => {
      if (!ctx.session?.user) {
        throw new Error("Требуется авторизация");
      }

      try {
        const results = await getSessionResults(input.sessionId);

        // Проверить доступ пользователя к этой сессии
        if (results.session.userId !== ctx.session.user.id) {
          throw new Error("Доступ запрещен");
        }

        // Проверить, что сессия завершена
        if (results.session.status !== "completed") {
          throw new Error("Сессия еще не завершена");
        }

        // Извлечь оценки из сообщений для дополнительной аналитики
        const scores = results.messages
          .filter((msg) => msg.isAi)
          .map((msg) => {
            if (msg.analysisNote) {
              const scoreMatch = msg.analysisNote.match(/SCORE:\s*(\d+)/);
              return scoreMatch ? parseInt(scoreMatch[1], 10) : null;
            }
            return null;
          });

        // Извлечь все feedback'и
        const feedbacks = extractAllFeedbacks(
          results.messages.filter((msg) => msg.isAi).map((msg) => msg.analysisNote)
        );

        // Форматировать результаты для фронтенда
        return {
          // Основные метрики
          score: results.session.finalScore || 5, // оценка от 1-10
          scorePercentage: (results.session.finalScore || 5) * 10, // оценка в процентах (0-100)
          feedback: results.session.expertFeedback || "Интервью завершено", // экспертный фидбек

          // Информация о сессии
          sessionId: results.session.id,
          scenarioTitle: results.session.scenarioTitle,
          status: results.session.status,
          startedAt: results.session.startedAt,
          finishedAt: results.session.finishedAt,
          durationMinutes: results.session.sessionDurationMinutes,

          // Аналитика по ответам
          questionCount: results.analytics.questionCount,
          messageCount: results.analytics.messageCount,
          averageScoreByQuestion: scores.length > 0
            ? Math.round(scores.reduce((sum, s) => sum + (s || 0), 0) / scores.length)
            : 5,

          // Детальная информация (для расширенного отчета)
          details: {
            scores: scores.filter((s): s is number => s !== null),
            feedbacks: feedbacks,
            messages: results.messages.map((msg) => ({
              id: msg.id,
              isAi: msg.isAi,
              content: msg.messageText,
              analysisNote: msg.analysisNote,
              createdAt: msg.createdAt,
            })),
          },
        };
      } catch (error) {
        console.error("Error getting session results:", error);
        throw new Error(`Ошибка при получении результатов: ${error instanceof Error ? error.message : "неизвестная ошибка"}`);
      }
    }),
});
