"use client";
import * as React from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ProgressBar } from "./ui/progress-bar";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
// when real data arrives we will fetch { id, text, ... } from the server
// and probably track user answers separately.
export interface InterviewQuestion {
  id: number;
  text: string;
}

// simple mock data; later this will come from TRPC/props
const dummyQuestions: InterviewQuestion[] = [
  { id: 1, text: "Первый вопрос" },
  { id: 2, text: "Второй вопрос" },
  { id: 3, text: "Третий вопрос" },
  { id: 4, text: "Четвёртый вопрос" },
];

export default function InterviewWindow() {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [experience, setExperience] = React.useState(0);

  const total = dummyQuestions.length;
  const progress = Math.round((currentIndex / total) * 100);

  const handleNext = () => {
    if (currentIndex < total) {
      setCurrentIndex((i) => i + 1);
      setExperience((xp) => xp + 10);
    }
  };

  const handleFinish = () => {
    // placeholder; in real app, submit answers and navigate
    alert("Интервью закончено! XP = " + experience);
  };

  return (
    <main className="max-w-4xl mx-auto py-16 px-6">
      {/* header row */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-semibold">Название сценария</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            XP: {experience}
          </div>
          <Button size="sm" onClick={handleFinish} variant="outline">
            Закончить
          </Button>
        </div>
      </div>

      <ProgressBar percent={progress} className="mb-8" />

      {/* grid of question cards or placeholders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
        {dummyQuestions.map((q, idx) => (
          <Card
            key={q.id}
            className={
              "h-32 flex flex-col justify-center items-center text-center " +
              (idx === currentIndex ? "ring-2 ring-blue-500" : "")
            }
            // indicate which card is active to assist screen-reader users
            aria-current={idx === currentIndex ? "step" : undefined}
          >
            <p className="text-sm px-2 truncate">{q.text}</p>
            {idx === currentIndex && (
              <Button
                size="xs"
                variant="ghost"
                className="mt-2"
                onClick={handleNext}
              >
                Следующий
              </Button>
            )}
          </Card>
        ))}
      </div>
    </main>
  );
}
