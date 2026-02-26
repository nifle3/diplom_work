import Link from "next/link";

import { serverTrpc } from "@/lib/trpcServer";

import { Card } from "@/components/ui/card";


export default async function DashboardPage() {
  const trpcCaller = await serverTrpc();

  const userStats = await trpcCaller.user.getStats();
  const recentActivity = await trpcCaller.activity.getLatestUserActivity();
  const latestCourses = await trpcCaller.script.getLatest({ limit: 5 });

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
    <main className="max-w-4xl mx-auto py-16 px-6">
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-3xl font-bold">
          Привет, {userStats.name}
        </h1>
        <div className="text-sm font-medium bg-yellow-200 text-yellow-900 px-3 py-1 rounded-full">
          Стрик: {userStats.streak} дней
        </div>
      </div>

      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-4">Последняя активность</h2>
        {recentActivity?.length ? (
          <div className="grid grid-cols-3 gap-6">
            {recentActivity.map((activity) => (
              <Card key={activity.id} className="h-24 flex flex-col justify-between p-4">
                <div className="font-medium text-base">{activity.title}</div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-gray-500">Нет недавней активности</div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-6">Новые курсы</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {
            latestCourses?.map((course) => (
              <Card key={course.id} className="h-40 flex flex-col">
                <div className="bg-gray-200 dark:bg-gray-700 h-20" />
                <div className="px-4 py-2 flex-1 flex flex-col justify-between">
                  <div className="text-sm font-medium">{course.title}</div>
                  <Link href={{pathname: `/courses/${course.id}`}} className="text-xs text-blue-600 hover:underline">
                    Открыть
                  </Link>
                </div>
              </Card>
            ))
          }
        </div>

        <div className="mt-8 text-center">
          <Link
            href={{pathname: "/courses"}}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Все курсы &rarr;
          </Link>
        </div>
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
    </div>
  );
}
