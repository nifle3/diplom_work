"use client";
import { Card } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export default function AuthenticatedWindow() {
  return (
    <main className="max-w-4xl mx-auto py-16 px-6">
      {/* greeting + streak */}
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-3xl font-bold">Привет, FirstNAME</h1>
        <div className="text-sm font-medium bg-yellow-200 text-yellow-900 px-3 py-1 rounded-full">
          Стрик: 0 дней
        </div>
      </div>

      {/* last activity section */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-4">Последняя активность</h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-md">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-md">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-md">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      </section>

      {/* new courses */}
      <section>
        <h2 className="text-xl font-semibold mb-6">Новые курсы</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-40 flex flex-col">
              <div className="bg-gray-200 dark:bg-gray-700 h-20" />
              <div className="px-4 py-2 flex-1 flex flex-col justify-between">
                <div className="text-sm font-medium">Курс {i}</div>
                <button className="text-xs text-blue-600 hover:underline">
                  Открыть
                </button>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
