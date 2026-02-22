"use client";
import * as React from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ProgressBar } from "./ui/progress-bar";

export default function SandboxWindow() {
  // mock data only — no logic yet
  const scenarioName = "Окно песочницы";
  const progress = 18; // percent
  const experience = 0;

  return (
    <main className="max-w-5xl mx-auto py-12 px-6">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-semibold">{scenarioName}</h1>

        <div className="flex items-center gap-3">
          <Button size="sm" variant="ghost">
            Закончить
          </Button>
          <Button size="sm" variant="outline">
            Рестарт
          </Button>

          <div className="flex items-center gap-2">
            <div className="text-sm font-medium bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded">
              Опыт: {experience}
            </div>
            <div className="w-6 h-6 rounded-full bg-black" />
          </div>
        </div>
      </div>

      <ProgressBar percent={progress} className="mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-6">
          <Card className="h-36 bg-gray-100 flex items-center justify-center">
            <div className="text-sm text-gray-600">Большой блок 1 (мок)</div>
          </Card>

          <Card className="h-36 bg-gray-100 flex items-center justify-center">
            <div className="text-sm text-gray-600">Большой блок 2 (мок)</div>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex-1">
            <Card className="h-44 bg-gray-100 flex items-center justify-center">
              <div className="text-sm text-gray-600">Редактировать</div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
