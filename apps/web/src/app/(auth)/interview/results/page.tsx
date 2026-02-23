import Header from "../../../components/header";
import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { ProgressBar } from "../../../components/ui/progress-bar";
import { Button } from "../../../components/ui/button";
import { Trophy, Star, MessageSquare } from "lucide-react";

export const metadata = {
  title: "Результаты интервью",
};

export default function ResultsPage() {
  const scorePercent = 78;
  const experience = 150;
  const feedbackText =
    "Спасибо за прохождение! В целом вы справились неплохо, но обратите внимание на структуру ответов и говорите чётче. " +
    "Работайте над примерами из реального опыта и повторяйте тему дизайна систем.";

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <Header />
      <main className="max-w-4xl mx-auto py-16 px-6 space-y-10">
        <h1 className="text-3xl font-bold text-center">Результаты интервью</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* score card */}
          <Card className="flex flex-col items-center justify-center text-center">
            <CardHeader>
              <Trophy className="size-6 text-yellow-500" />
              <CardTitle className="mt-2">Оценка</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-extrabold text-blue-600">{scorePercent}%</div>
              <div className="w-full mt-4">
                <ProgressBar percent={scorePercent} />
              </div>
            </CardContent>
          </Card>

          {/* experience card */}
          <Card className="flex flex-col items-center justify-center text-center">
            <CardHeader>
              <Star className="size-6 text-yellow-400" />
              <CardTitle className="mt-2">Получено опыта</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">{experience} XP</div>
            </CardContent>
          </Card>
        </div>

        {/* feedback section */}
        <Card>
          <CardHeader>
            <MessageSquare className="size-5" />
            <CardTitle className="ml-2">Фидбек</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground/90">
              {feedbackText}
            </p>
          </CardContent>
        </Card>

        {/* actions */}
        <div className="flex justify-center gap-4">
          <Button variant="outline" size="sm">
            Пройти ещё раз
          </Button>
          <Button size="sm">На дашборд</Button>
        </div>
      </main>
    </div>
  );
}
