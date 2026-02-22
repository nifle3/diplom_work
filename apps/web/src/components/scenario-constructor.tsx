"use client";
import React from "react";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

const mock = {
  title: "Название интервью",
  context:
    "Краткое описание контекста интервью. Здесь можно описать цель, целевую аудиторию и ожидаемые результаты.",
  examples: [
    "Как вы реализуете X?",
    "Опишите алгоритм для решения Y.",
    "Расскажите про подход к оптимизации Z.",
  ],
  criteria: [
    "Понимание теории",
    "Практические навыки",
    "Чистота кода и архитектура",
    "Коммуникация и объяснение решений",
  ],
};

export default function ScenarioConstructor() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <input
              className="border border-gray-300 dark:border-neutral-700 px-3 py-2 rounded-none text-lg"
              defaultValue={mock.title}
            />
            <Button variant="outline" size="sm">Сохранить</Button>
            <Button variant="ghost" size="sm">Перейти в песочницу</Button>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-sm text-neutral-600 dark:text-neutral-300">Назад</button>
            <div className="flex items-center gap-2">
              <span className="text-sm">Опыт: 0</span>
              <div className="w-8 h-8 rounded-full bg-black dark:bg-white" />
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Контекст</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">{mock.context}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Примеры вопросов</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-4 text-sm text-neutral-700 dark:text-neutral-300">
                  {mock.examples.map((q, i) => (
                    <li key={i} className="py-1">
                      {q}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-7">
            <Card>
              <CardHeader>
                <CardTitle>Общие критерии</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mock.criteria.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 p-3 rounded-none"
                    >
                      <div className="w-3 h-3 mt-2 bg-neutral-300 dark:bg-neutral-600 rounded-full" />
                      <div className="text-sm text-neutral-700 dark:text-neutral-300">{c}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
