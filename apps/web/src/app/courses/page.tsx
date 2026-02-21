import Link from "next/link";
import Header from "../../components/header";
import { Card } from "../../components/ui/card";

export default function CoursesPage() {
  // simple static markup for all-courses page
  const dummyCourses = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    title: `Курс ${i + 1}`,
  }));

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <Header />
      <main className="max-w-6xl mx-auto py-16 px-6 flex">
        {/* content */}
        <section className="flex-1">
          <h1 className="text-3xl font-bold mb-8">Все курсы</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {dummyCourses.map((c) => (
              <Card key={c.id} className="flex flex-col h-40">
                <div className="bg-gray-200 dark:bg-gray-700 h-20" />
                <div className="px-4 py-3 flex-1 flex flex-col justify-between">
                  <div className="text-sm font-medium truncate">{c.title}</div>
                  <Link
                    href="#"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Открыть
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* sidebar placeholder for filters */}
        <aside className="hidden lg:block w-64 pl-8">
          <div className="text-sm font-semibold mb-4">Фильтры:</div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-2/3" />
          </div>
        </aside>
      </main>
    </div>
  );
}
