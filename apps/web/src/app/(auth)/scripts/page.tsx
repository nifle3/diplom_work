import { serverTrpc } from "@/lib/trpcServer";
import { CourseCard } from "@/components/course-card";
import { ScriptsFilters } from "./ScriptsFilters";
import type { Metadata } from "next";

const metadata: Metadata = {
  title: "Все сценарии",
}

interface ScriptsPageProps {
  searchParams: Promise<{ page?: string; categoryId?: string; search?: string }>;
}

export default async function ScriptsPage({ searchParams }: ScriptsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10) || 1;
  const categoryId = params.categoryId;
  const search = params.search;

  const trpcCaller = await serverTrpc();

  const [coursesData, categories] = await Promise.all([
    trpcCaller.script.list({ page, limit: 12, categoryId, search }),
    trpcCaller.script.categories(),
  ]);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <main className="max-w-7xl mx-auto py-12 px-6 flex gap-8">
        <aside className="w-64 flex-shrink-0">
          <ScriptsFilters
            categories={categories}
            currentPage={coursesData.page}
            currentCategoryId={categoryId}
            currentSearch={search}
            totalPages={coursesData.pages}
          />
        </aside>

        <section className="flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Все курсы</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Найдено курсов: <strong>{coursesData.total}</strong>
            </p>
          </div>

          {coursesData.total === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                По вашему запросу курсы не найдены
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {coursesData.courses.map((course) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  context={course.context}
                  categoryName={course.categoryName!}
                  expertName={course.expertName!}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}