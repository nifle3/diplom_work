"use client";
import * as React from "react";
import Link from "next/link";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface Scenario {
  id: string;
  title: string;
}

// simple mock data; later this will come from TRPC/props
const dummyScenarios: Scenario[] = [
  { id: "1", title: "Собеседование для frontend-разработчика" },
  { id: "2", title: "Сценарий HR-интервью" },
  { id: "3", title: "Кейс для менеджера проектов" },
];

export default function ExpertWindow() {
  return (
    <main className="max-w-4xl mx-auto py-16 px-6">
      {/* header row */}
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-3xl font-bold">Рабочий кабинет эксперта</h1>
        <div className="flex items-center gap-4">
          <Link
            href="/scenarios/search"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Поиск сценариев
          </Link>
          <div className="text-sm font-medium bg-yellow-200 text-yellow-900 px-3 py-1 rounded-full">
            Опыт: 0
          </div>
        </div>
      </div>

      {/* my scenarios section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Мои сценарии</h2>
          <Button size="sm" onClick={() => alert("Добавить новый")}>
            Добавить новый
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {dummyScenarios.map((s) => (
            <Card key={s.id} className="p-4 flex justify-between items-center">
              <span className="font-medium truncate">{s.title}</span>
              <Link
                href={`/expert/scenarios/${s.id}`}
                className="text-blue-600 hover:underline text-sm"
              >
                Открыть
              </Link>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
