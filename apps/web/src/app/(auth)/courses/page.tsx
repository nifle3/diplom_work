import { useState, useCallback } from "react";
import { CategoriesFilter } from "@/components/courses-filter";
import { CourseCard, CourseCardSkeleton } from "@/components/course-card";
import { SearchCourses } from "@/components/search-courses";
import { Pagination } from "@/components/pagination";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

interface CouresPageSearchParams {
  page?: number;
  categoryId?: string;
  search?: string;

}

export default function CoursesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [search, setSearch] = useState("");

  const {
    data: coursesData,
    isPending: isLoadingCourses,
    error: coursesError,
  } = useQuery(
    trpc.scenarios.list.queryOptions({ page, categoryId, search, limit: 12 })
  );

  const {
    data: categories = [],
    isPending: isLoadingCategories,
    error: categoriesError,
  } = useQuery(trpc.scenarios.categories.queryOptions());

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    []
  );

  const handleSearch = useCallback((query: string) => {
    setSearch(query);
    setPage(1);
  }, []);

  const handleCategoryChange = useCallback(
    (newCategoryId: string | undefined) => {
      setCategoryId(newCategoryId);
      setPage(1);
    },
    []
  );

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <main className="max-w-7xl mx-auto py-12 px-6 flex gap-8">
        <aside className="w-64 flex-shrink-0">
          <div className="sticky top-20 space-y-6">
            <SearchCourses
              onSearch={handleSearch}
              isLoading={isLoadingCourses}
            />
            <CategoriesFilter
              categories={categories}
              selectedCategory={categoryId}
              onSelectCategory={handleCategoryChange}
              isLoading={isLoadingCategories || isLoadingCourses}
            />
          </div>
        </aside>

        <section className="flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Все курсы</h1>
            {coursesData && (
              <p className="text-gray-600 dark:text-gray-400">
                Найдено курсов: <strong>{coursesData.total}</strong>
              </p>
            )}
          </div>

          {coursesData && coursesData.total === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                По вашему запросу курсы не найдены
              </p>
            </div>
          )}

          {(isLoadingCourses || (coursesData && coursesData.courses.length > 0)) && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {isLoadingCourses
                ? Array.from({ length: 12 }).map((_, i) => (
                    <CourseCardSkeleton key={i} />
                  ))
                : coursesData?.courses.map((course) => (
                    <CourseCard
                      key={course.id}
                      id={course.id}
                      title={course.title}
                      context={course.context}
                      categoryName={course.categoryName}
                      expertName={course.expertName}
                    />
                  ))}
            </div>
          )}

          <Pagination
            currentPage={coursesData.page}
            totalPages={coursesData.pages}
            onPageChange={handlePageChange}
            isLoading={isLoadingCourses}
          />
        </section>
      </main>
    </div>
  );
}