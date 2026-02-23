"use client";

import { Card } from "./ui/card";
import Link from "next/link";
import { Skeleton } from "./ui/skeleton";
import { trpc } from "../utils/trpc";

export default function AuthenticatedWindow() {
  const { data, isLoading } = trpc.dashboard.getDashboard.useQuery();

  return (
    <main className="max-w-4xl mx-auto py-16 px-6">
      {/* greeting + streak */}
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-3xl font-bold">
          Привет, {isLoading ? <Skeleton className="inline-block w-24 h-8 align-middle" /> : data?.name || "..."}
        </h1>
        <div className="text-sm font-medium bg-yellow-200 text-yellow-900 px-3 py-1 rounded-full">
          Стрик: {isLoading ? <Skeleton className="inline-block w-8 h-6 align-middle" /> : data?.streak ?? 0} дней
        </div>
      </div>

      {/* last activity section */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-4">Последняя активность</h2>
        {isLoading ? (
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-md">
                <Skeleton className="h-full w-full" />
              </div>
            ))}
          </div>
        ) : data?.recentActivity?.length ? (
          <div className="grid grid-cols-3 gap-6">
            {data.recentActivity.map((activity) => (
              <Card key={activity.id} className="h-24 flex flex-col justify-between p-4">
                <div className="font-medium text-base">{activity.title}</div>
                <div className="text-xs text-gray-500">{new Date(activity.date).toLocaleDateString()}</div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-gray-500">Нет недавней активности</div>
        )}
      </section>

      {/* new courses */}
      <section>
        <h2 className="text-xl font-semibold mb-6">Новые курсы</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {isLoading
            ? [1, 2, 3].map((i) => (
                <Card key={i} className="h-40 flex flex-col">
                  <Skeleton className="bg-gray-200 dark:bg-gray-700 h-20 w-full" />
                  <div className="px-4 py-2 flex-1 flex flex-col justify-between">
                    <Skeleton className="h-6 w-24 mb-2" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </Card>
              ))
            : data?.latestCourses?.map((course) => (
                <Card key={course.id} className="h-40 flex flex-col">
                  <div className="bg-gray-200 dark:bg-gray-700 h-20" />
                  <div className="px-4 py-2 flex-1 flex flex-col justify-between">
                    <div className="text-sm font-medium">{course.title}</div>
                    <Link href={`/courses/${course.id}`} className="text-xs text-blue-600 hover:underline">
                      Открыть
                    </Link>
                  </div>
                </Card>
              ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/courses"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Все курсы &rarr;
          </Link>
        </div>
        {/* quick link to start an interview */}
        <div className="mt-4 text-center">
          <Link
            href="/interview"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            Начать интервью
          </Link>
        </div>
      </section>
    </main>
  );
}
