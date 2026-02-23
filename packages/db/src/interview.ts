import { db } from ".";
import {
  scenarios,
  questionTemplates,
  scenarioCriteria,
  specificCriteria,
  interviewSessions,
  chatMessages,
  user as userTable,
} from "./schema/scheme";
import { eq, and, isNull } from "drizzle-orm";

/**
 * Получить полный сценарий с вопросами и критериями для формирования системного промпта
 */
export async function getScenarioWithDetails(scenarioId: string) {
  const [scenario] = await db
    .select({
      id: scenarios.id,
      title: scenarios.title,
      context: scenarios.context,
      categoryId: scenarios.categoryId,
    })
    .from(scenarios)
    .where(and(eq(scenarios.id, scenarioId), isNull(scenarios.deletedAt)));

  if (!scenario) {
    throw new Error(`Сценарий ${scenarioId} не найден`);
  }

  // Получить вопросы
  const questions = await db
    .select({
      id: questionTemplates.id,
      text: questionTemplates.text,
    })
    .from(questionTemplates)
    .where(and(eq(questionTemplates.scenarioId, scenarioId), isNull(questionTemplates.deletedAt)));

  // Получить глобальные критерии
  const globalCriteria = await db
    .select({
      id: scenarioCriteria.id,
      content: scenarioCriteria.content,
    })
    .from(scenarioCriteria)
    .where(and(eq(scenarioCriteria.scenarioId, scenarioId), isNull(scenarioCriteria.deletedAt)));

  return {
    scenario,
    questions,
    globalCriteria,
  };
}

/**
 * Создать новую сессию интервью
 */
export async function createInterviewSession(userId: string, scenarioId: string) {
  const [session] = await db
    .insert(interviewSessions)
    .values({
      userId,
      scenarioId,
      status: "active",
    })
    .returning();

  return session;
}

/**
 * Сохранить сообщение в чате
 */
export async function saveChatMessage(
  sessionId: string,
  isAi: boolean,
  messageText: string,
  analysisNote?: string
) {
  const [message] = await db
    .insert(chatMessages)
    .values({
      sessionId,
      isAi,
      messageText,
      analysisNote,
    })
    .returning();

  return message;
}

/**
 * Получить историю чата сессии
 */
export async function getSessionChatHistory(sessionId: string) {
  const messages = await db
    .select({
      id: chatMessages.id,
      isAi: chatMessages.isAi,
      messageText: chatMessages.messageText,
      analysisNote: chatMessages.analysisNote,
      createdAt: chatMessages.createdAt,
    })
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, sessionId))
    .orderBy(chatMessages.createdAt);

  return messages;
}

/**
 * Завершить сессию интервью с финальной оценкой
 */
export async function completeInterviewSession(
  sessionId: string,
  finalScore: number,
  expertFeedback?: string
) {
  const [session] = await db
    .update(interviewSessions)
    .set({
      status: "completed",
      finalScore,
      expertFeedback,
      finishedAt: new Date(),
    })
    .where(eq(interviewSessions.id, sessionId))
    .returning();

  return session;
}

/**
 * Получить сессию по ID
 */
export async function getInterviewSession(sessionId: string) {
  const [session] = await db
    .select()
    .from(interviewSessions)
    .where(eq(interviewSessions.id, sessionId));

  return session;
}

/**
 * Получить первый вопрос из сценария или сгенерировать его
 */
export async function getFirstQuestion(scenarioId: string): Promise<string> {
  const [firstQuestion] = await db
    .select({ text: questionTemplates.text })
    .from(questionTemplates)
    .where(eq(questionTemplates.scenarioId, scenarioId))
    .limit(1);

  if (firstQuestion) {
    return firstQuestion.text;
  }

  // Если вопросов нет, возвращаем стандартный стартовый вопрос
  return "Расскажите немного о себе и своем опыте.";
}

/**
 * Обновить XP и streak пользователя при завершении сессии
 */
export async function updateUserProgressOnSessionComplete(
  userId: string,
  xpGain: number,
  finalScore: number
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [currentUser] = await db
    .select({
      xp: userTable.xp,
      currentStreak: userTable.currentStreak,
      lastActivityDate: userTable.lastActivityDate,
    })
    .from(userTable)
    .where(eq(userTable.id, userId));

  if (!currentUser) {
    throw new Error(`Пользователь ${userId} не найден`);
  }

  let newStreak = currentUser.currentStreak;

  // Проверить, не прошел ли день
  if (currentUser.lastActivityDate) {
    const lastActivity = new Date(currentUser.lastActivityDate);
    lastActivity.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastActivity.getTime() < yesterday.getTime()) {
      // Streak прерван, начинаем заново
      newStreak = 1;
    } else if (lastActivity.getTime() < today.getTime()) {
      // Продолжаем streak
      newStreak = currentUser.currentStreak + 1;
    }
  } else {
    // Первая активность
    newStreak = 1;
  }

  const newXp = (currentUser.xp ?? 0) + xpGain;

  const [updatedUser] = await db
    .update(userTable)
    .set({
      xp: newXp,
      currentStreak: newStreak,
      lastActivityDate: new Date(),
    })
    .where(eq(userTable.id, userId))
    .returning();

  return {
    newXp,
    newStreak,
    xpGained: xpGain,
  };
}

/**
 * Получить полную информацию о результатах сессии интервью
 */
export async function getSessionResults(sessionId: string) {
  const [session] = await db
    .select({
      id: interviewSessions.id,
      userId: interviewSessions.userId,
      scenarioId: interviewSessions.scenarioId,
      status: interviewSessions.status,
      finalScore: interviewSessions.finalScore,
      expertFeedback: interviewSessions.expertFeedback,
      startedAt: interviewSessions.startedAt,
      finishedAt: interviewSessions.finishedAt,
    })
    .from(interviewSessions)
    .where(eq(interviewSessions.id, sessionId));

  if (!session) {
    throw new Error(`Сессия ${sessionId} не найдена`);
  }

  // Получить информацию о сценарии
  const [scenario] = await db
    .select({
      id: scenarios.id,
      title: scenarios.title,
    })
    .from(scenarios)
    .where(eq(scenarios.id, session.scenarioId));

  // Получить историю сообщений
  const messages = await db
    .select({
      id: chatMessages.id,
      isAi: chatMessages.isAi,
      messageText: chatMessages.messageText,
      analysisNote: chatMessages.analysisNote,
      createdAt: chatMessages.createdAt,
    })
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, sessionId))
    .orderBy(chatMessages.createdAt);

  // Подсчитать количество вопросов
  const questionCount = Math.ceil(messages.filter((m) => m.isAi).length);

  // Вычислить сессию продолжительность
  const sessionDuration =
    session.finishedAt && session.startedAt
      ? Math.round((session.finishedAt.getTime() - session.startedAt.getTime()) / 1000 / 60)
      : 0;

  return {
    session: {
      id: session.id,
      userId: session.userId,
      scenarioId: session.scenarioId,
      scenarioTitle: scenario?.title || "Неизвестный сценарий",
      status: session.status,
      finalScore: session.finalScore,
      scorePercentage: session.finalScore ? session.finalScore * 10 : 50,
      expertFeedback: session.expertFeedback,
      startedAt: session.startedAt,
      finishedAt: session.finishedAt,
      sessionDurationMinutes: sessionDuration,
    },
    messages: messages.map((msg) => ({
      id: msg.id,
      isAi: msg.isAi,
      messageText: msg.messageText,
      analysisNote: msg.analysisNote,
      createdAt: msg.createdAt,
    })),
    analytics: {
      questionCount,
      messageCount: messages.length,
    },
  };
}
