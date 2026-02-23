/**
 * Утилиты для парсинга и анализа оценок из feedback сообщений
 */

interface ParsedScore {
  score: number | null;
  feedback: string | null;
}

/**
 * Парсит SCORE и FEEDBACK из analysisNote сообщения
 */
export function parseScoreFromAnalysisNote(analysisNote: string | null | undefined): ParsedScore {
  if (!analysisNote) {
    return { score: null, feedback: null };
  }

  const scoreMatch = analysisNote.match(/SCORE:\s*(\d+)/);
  const feedbackMatch = analysisNote.match(/FEEDBACK:\s*(.+?)(?=\nSCORE:|$)/s);

  const score = scoreMatch ? parseInt(scoreMatch[1], 10) : null;
  const feedback = feedbackMatch ? feedbackMatch[1].trim() : null;

  return { score, feedback };
}

/**
 * Вычисляет финальный скор на основе массива сообщений с оценками
 * Возвращает среднее значение или 5 если нет оценок
 */
export function calculateFinalScore(
  scores: (number | null)[]
): number {
  const validScores = scores.filter((score): score is number => score !== null);

  if (validScores.length === 0) {
    return 5; // Default score
  }

  const average = validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
  return Math.round(average);
}

/**
 * Вычисляет финальный скор из массива сообщений (analysisNote)
 */
export function calculateFinalScoreFromMessages(
  analysisNotes: (string | null | undefined)[]
): number {
  const scores = analysisNotes.map((note) => {
    const { score } = parseScoreFromAnalysisNote(note);
    return score;
  });

  return calculateFinalScore(scores);
}

/**
 * Извлекает все feedback'и из сообщений для отображения в итоговом отчете
 */
export function extractAllFeedbacks(
  analysisNotes: (string | null | undefined)[]
): string[] {
  return analysisNotes
    .map((note) => {
      const { feedback } = parseScoreFromAnalysisNote(note);
      return feedback;
    })
    .filter((feedback): feedback is string => feedback !== null);
}

/**
 * Форматирует массив оценок для отображения в статистике
 */
export function formatScoreStats(scores: (number | null)[]): {
  average: number;
  min: number | null;
  max: number | null;
  count: number;
} {
  const validScores = scores.filter((score): score is number => score !== null);

  return {
    average: validScores.length > 0 ? Math.round(validScores.reduce((sum, s) => sum + s, 0) / validScores.length) : 0,
    min: validScores.length > 0 ? Math.min(...validScores) : null,
    max: validScores.length > 0 ? Math.max(...validScores) : null,
    count: validScores.length,
  };
}
