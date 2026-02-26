import { serverTrpc } from "@/lib/trpcServer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import { Trophy, Star, MessageSquare, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Результаты интервью",
};

interface ResultsPageProps {
  searchParams: Promise<{ sessionId?: string }>;
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const params = await searchParams;
  const sessionId = params.sessionId;

  if (!sessionId) {
    redirect("/scripts");
  }

  const trpc = await serverTrpc();

  let sessionData;
  try {
    sessionData = await trpc.interview.getSession({ sessionId });
  } catch (error) {
    redirect("/scripts");
  }

  const { session, messages } = sessionData;

  const feedbacks = messages
    .filter(msg => msg.isAi && msg.analysisNote)
    .map(msg => {
      const note = msg.analysisNote!;
      const feedbackMatch = note.match(/FEEDBACK:\s*(.+?)(?=\nSCORE:|$)/s);
      const scoreMatch = note.match(/SCORE:\s*(\d+)/);
      return {
        feedback: feedbackMatch ? feedbackMatch[1].trim() : "",
        score: scoreMatch ? parseInt(scoreMatch[1], 10) : null,
      };
    })
    .filter(item => item.feedback || item.score !== null);

  const scorePercent = Math.round(session.finalScore * 10); // Convert to percentage
  const xpGained = Math.round(session.finalScore * 10); // Same calculation as in finishSession

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <main className="max-w-4xl mx-auto py-16 px-6 space-y-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Результаты интервью</h1>
          <Link href="/scripts">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              К сценариям
            </Button>
          </Link>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400">
            {session.scenarioTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="flex flex-col items-center justify-center text-center">
            <CardHeader>
              <Trophy className="size-6 text-yellow-500" />
              <CardTitle className="mt-2">Оценка</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-extrabold text-blue-600">{scorePercent}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Средний балл: {session.finalScore.toFixed(1)}/10
              </div>
              <div className="w-full mt-4">
                <ProgressBar percent={scorePercent} />
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col items-center justify-center text-center">
            <CardHeader>
              <Star className="size-6 text-yellow-400" />
              <CardTitle className="mt-2">Получено опыта</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">+{xpGained} XP</div>
            </CardContent>
          </Card>
        </div>

        {feedbacks.length > 0 && (
          <Card>
            <CardHeader>
              <MessageSquare className="size-5" />
              <CardTitle className="ml-2">Обратная связь</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {feedbacks.map((item, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  {item.feedback && (
                    <p className="text-sm leading-relaxed text-foreground/90 mb-2">
                      {item.feedback}
                    </p>
                  )}
                  {item.score !== null && (
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Оценка: {item.score}/10
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center gap-4">
          <Link href={`/interview?scenario=${session.scenarioId}`}>
            <Button variant="outline" size="sm">
              Пройти ещё раз
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm">На дашборд</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
