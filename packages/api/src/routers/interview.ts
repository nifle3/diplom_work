import { z } from "zod";
import { router, basicAuthProtectedProcedure } from "..";
import { db } from "@diplom_work/db";
import {
  interviewSessionsTable,
  chatMessagesTable,
  scenariosTable,
  scenarioCriteriaTable,
  questionTemplatesTable,
  usersTable,
  criteriaTypesTable,
} from "@diplom_work/db/schema/scheme";
import { eq, and, desc } from "drizzle-orm";
import {
  generateInterviewSystemPrompt,
  createInterviewLLM,
  createMemory,
  parseAIResponse,
} from "../lib/langchain";
import { calculateFinalScore } from "../lib/score-parser";

export const interviewRouter = router({
  startSession: basicAuthProtectedProcedure
    .input(z.object({ scenarioId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { scenarioId } = input;
      const userId = ctx.session.user.id;

      // Verify scenario exists and is not deleted
      const scenario = await db
        .select()
        .from(scenariosTable)
        .where(and(eq(scenariosTable.id, scenarioId), eq(scenariosTable.deletedAt, null)))
        .limit(1);

      if (!scenario.length) {
        throw new Error("Scenario not found");
      }

      const criteria = await db
        .select({
          content: scenarioCriteriaTable.content,
          typeName: criteriaTypesTable.name,
        })
        .from(scenarioCriteriaTable)
        .innerJoin(criteriaTypesTable, eq(scenarioCriteriaTable.typeId, criteriaTypesTable.id))
        .where(and(eq(scenarioCriteriaTable.scenarioId, scenarioId), eq(scenarioCriteriaTable.deletedAt, null)));

      const questions = await db
        .select({ text: questionTemplatesTable.text })
        .from(questionTemplatesTable)
        .where(and(eq(questionTemplatesTable.scenarioId, scenarioId), eq(questionTemplatesTable.deletedAt, null)));

      const sessionResult = await db
        .insert(interviewSessionsTable)
        .values({
          userId,
          scenarioId,
          status: "active",
          startedAt: new Date(),
        })
        .returning({ id: interviewSessionsTable.id });

      const sessionId = sessionResult[0].id;

      // Build system prompt
      const systemPrompt = generateInterviewSystemPrompt({
        scenarioTitle: scenario[0].title,
        scenarioContext: scenario[0].context,
        globalCriteria: criteria.map(c => `${c.typeName}: ${c.content}`).join('\n'),
        questionList: questions.map(q => `- ${q.text}`).join('\n'),
      });

      // Generate first AI message
      const llm = createInterviewLLM();
      const memory = createMemory();

      const response = await llm.invoke([
        { role: "system", content: systemPrompt },
        { role: "user", content: "Начнем собеседование. Поприветствуй кандидата и задай первый вопрос." }
      ]);

      const aiMessage = response.content as string;

      // Save AI message
      await db.insert(chatMessagesTable).values({
        sessionId,
        isAi: true,
        messageText: aiMessage,
        createdAt: new Date(),
      });

      return { sessionId, message: aiMessage };
    }),

  sendMessage: basicAuthProtectedProcedure
    .input(z.object({ sessionId: z.string().uuid(), userMessage: z.string().min(1) }))
    .subscription(async function* ({ input, ctx }) {
      const { sessionId, userMessage } = input;
      const userId = ctx.session.user.id;

      // Verify session ownership and status
      const session = await db
        .select()
        .from(interviewSessionsTable)
        .where(and(
          eq(interviewSessionsTable.id, sessionId),
          eq(interviewSessionsTable.userId, userId),
          eq(interviewSessionsTable.status, "active")
        ))
        .limit(1);

      if (!session.length) {
        throw new Error("Session not found or not active");
      }

      // Save user message
      await db.insert(chatMessagesTable).values({
        sessionId,
        isAi: false,
        messageText: userMessage,
        createdAt: new Date(),
      });

      // Load scenario for system prompt
      const scenarioData = await db
        .select({
          title: scenariosTable.title,
          context: scenariosTable.context,
        })
        .from(scenariosTable)
        .innerJoin(interviewSessionsTable, eq(scenariosTable.id, interviewSessionsTable.scenarioId))
        .where(eq(interviewSessionsTable.id, sessionId))
        .limit(1);

      // Load criteria
      const criteria = await db
        .select({
          content: scenarioCriteriaTable.content,
          typeName: criteriaTypesTable.name,
        })
        .from(scenarioCriteriaTable)
        .innerJoin(criteriaTypesTable, eq(scenarioCriteriaTable.typeId, criteriaTypesTable.id))
        .innerJoin(scenariosTable, eq(scenarioCriteriaTable.scenarioId, scenariosTable.id))
        .innerJoin(interviewSessionsTable, eq(scenariosTable.id, interviewSessionsTable.scenarioId))
        .where(and(
          eq(interviewSessionsTable.id, sessionId),
          eq(scenarioCriteriaTable.deletedAt, null)
        ));

      // Load questions
      const questions = await db
        .select({ text: questionTemplatesTable.text })
        .from(questionTemplatesTable)
        .innerJoin(scenariosTable, eq(questionTemplatesTable.scenarioId, scenariosTable.id))
        .innerJoin(interviewSessionsTable, eq(scenariosTable.id, interviewSessionsTable.scenarioId))
        .where(and(
          eq(interviewSessionsTable.id, sessionId),
          eq(questionTemplatesTable.deletedAt, null)
        ));

      // Load chat history
      const history = await db
        .select({
          isAi: chatMessagesTable.isAi,
          messageText: chatMessagesTable.messageText,
        })
        .from(chatMessagesTable)
        .where(eq(chatMessagesTable.sessionId, sessionId))
        .orderBy(chatMessagesTable.createdAt);

      // Build system prompt
      const systemPrompt = generateInterviewSystemPrompt({
        scenarioTitle: scenarioData[0].title,
        scenarioContext: scenarioData[0].context,
        globalCriteria: criteria.map(c => `${c.typeName}: ${c.content}`).join('\n'),
        questionList: questions.map(q => `- ${q.text}`).join('\n'),
      });

      // Create LLM with streaming
      const llm = createInterviewLLM();

      // Prepare messages for streaming
      const messages = [
        { role: "system", content: systemPrompt },
        ...history.map(h => ({
          role: h.isAi ? "assistant" : "user" as const,
          content: h.messageText,
        })),
        { role: "user", content: userMessage },
      ];

      // Stream the response
      const stream = await llm.stream(messages);
      let fullResponse = "";

      for await (const chunk of stream) {
        const token = chunk.content as string;
        fullResponse += token;
        yield token;
      }

      // Parse the complete response
      const parsed = parseAIResponse(fullResponse);

      // Save AI message with analysis
      await db.insert(chatMessagesTable).values({
        sessionId,
        isAi: true,
        messageText: parsed.message,
        analysisNote: parsed.feedback ? `FEEDBACK: ${parsed.feedback}${parsed.score ? `\nSCORE: ${parsed.score}` : ''}` : null,
        createdAt: new Date(),
      });
    }),

  finishSession: basicAuthProtectedProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { sessionId } = input;
      const userId = ctx.session.user.id;

      // Verify session ownership
      const session = await db
        .select()
        .from(interviewSessionsTable)
        .where(and(
          eq(interviewSessionsTable.id, sessionId),
          eq(interviewSessionsTable.userId, userId),
          eq(interviewSessionsTable.status, "active")
        ))
        .limit(1);

      if (!session.length) {
        throw new Error("Session not found or not active");
      }

      // Get all scores from chat messages
      const messages = await db
        .select({ analysisNote: chatMessagesTable.analysisNote })
        .from(chatMessagesTable)
        .where(and(
          eq(chatMessagesTable.sessionId, sessionId),
          eq(chatMessagesTable.isAi, true)
        ));

      const scores = messages
        .map(m => m.analysisNote)
        .filter(Boolean)
        .map(note => {
          const match = note!.match(/SCORE:\s*(\d+)/);
          return match ? parseInt(match[1], 10) : null;
        })
        .filter(score => score !== null) as number[];

      const finalScore = calculateFinalScore(scores);

      // Calculate XP gain (score * 10)
      const xpGained = Math.round(finalScore * 10);

      // Update session
      await db
        .update(interviewSessionsTable)
        .set({
          status: "finished",
          finalScore,
          finishedAt: new Date(),
        })
        .where(eq(interviewSessionsTable.id, sessionId));

      // Update user stats in transaction
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      await db.transaction(async (tx) => {
        // Get current user data
        const user = await tx
          .select({ xp: usersTable.xp, lastActivityDate: usersTable.lastActivityDate, currentStreak: usersTable.currentStreak })
          .from(usersTable)
          .where(eq(usersTable.id, userId))
          .limit(1);

        if (!user.length) return;

        const currentUser = user[0];
        let newStreak = 1;

        if (currentUser.lastActivityDate) {
          const lastDate = new Date(currentUser.lastActivityDate);
          const isYesterday = lastDate.toDateString() === yesterday.toDateString();
          const isToday = lastDate.toDateString() === now.toDateString();

          if (isToday || isYesterday) {
            newStreak = currentUser.currentStreak + 1;
          }
        }

        // Update user
        await tx
          .update(usersTable)
          .set({
            xp: currentUser.xp + xpGained,
            currentStreak: newStreak,
            lastActivityDate: now,
          })
          .where(eq(usersTable.id, userId));
      });

      return { sessionId, finalScore, xpGained };
    }),

  getSession: basicAuthProtectedProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const { sessionId } = input;
      const userId = ctx.session.user.id;

      // Get session with scenario title
      const sessionData = await db
        .select({
          id: interviewSessionsTable.id,
          status: interviewSessionsTable.status,
          finalScore: interviewSessionsTable.finalScore,
          startedAt: interviewSessionsTable.startedAt,
          finishedAt: interviewSessionsTable.finishedAt,
          scenarioId: interviewSessionsTable.scenarioId,
          scenarioTitle: scenariosTable.title,
        })
        .from(interviewSessionsTable)
        .innerJoin(scenariosTable, eq(interviewSessionsTable.scenarioId, scenariosTable.id))
        .where(and(
          eq(interviewSessionsTable.id, sessionId),
          eq(interviewSessionsTable.userId, userId)
        ))
        .limit(1);

      if (!sessionData.length) {
        throw new Error("Session not found");
      }

      // Get chat messages
      const messages = await db
        .select({
          id: chatMessagesTable.id,
          isAi: chatMessagesTable.isAi,
          messageText: chatMessagesTable.messageText,
          analysisNote: chatMessagesTable.analysisNote,
          createdAt: chatMessagesTable.createdAt,
        })
        .from(chatMessagesTable)
        .where(eq(chatMessagesTable.sessionId, sessionId))
        .orderBy(chatMessagesTable.createdAt);

      return {
        session: sessionData[0],
        messages,
      };
    }),
});