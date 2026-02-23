import Link from "next/link";
import type { Metadata } from "next";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Рабочий кабинет эксперта",
};

export default function ExpertPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <main className="max-w-4xl mx-auto py-16 px-6">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-3xl font-bold">Рабочий кабинет эксперта</h1>
          <div className="flex items-center gap-4">
            <Link
              href={{ pathname: "/scenarios/search" }}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Поиск сценариев
            </Link>
            <div className="text-sm font-medium bg-yellow-200 text-yellow-900 px-3 py-1 rounded-full">
              Опыт: 0
            </div>
          </div>
        </div>

        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Мои сценарии</h2>
            <Button size="sm" onClick={() => alert("Добавить новый")}>
              Добавить новый
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4">
              <Card key={s.id} className="p-4 flex justify-between items-center">
                <span className="font-medium truncate">{s.title}</span>
                <Link
                  href={`/expert/scenarios/${s.id}`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Открыть
                </Link>
              </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
