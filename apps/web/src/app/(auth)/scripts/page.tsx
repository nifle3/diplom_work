import type { Metadata } from "next";

import { CourseCard } from "@/components/course-card";
import { serverTrpc } from "@/lib/trpcServer";
import { ScriptsFilters } from "./ScriptsFilters";

export const metadata: Metadata = {
	title: "Все сценарии",
};

interface ScriptsPageProps {
	searchParams: Promise<{
		page?: string;
		categoryId?: string;
		search?: string;
	}>;
}

export default async function ScriptsPage({ searchParams }: ScriptsPageProps) {
	const { page, categoryId, search } = await searchParams;
	const pageInt = Number.parseInt(page || "1", 10) || 1;

	const trpcCaller = await serverTrpc();

	const { 0: coursesData, 1: categories} = await Promise.all([
		trpcCaller.script.list({ page: pageInt, limit: 12, categoryId, search }),
		trpcCaller.script.categories(),
	]);

	return (
		<div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
			<main className="mx-auto flex max-w-7xl gap-8 px-6 py-12">
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
						<h1 className="mb-2 font-bold text-3xl">Все курсы</h1>
						<p className="text-gray-600 dark:text-gray-400">
							Найдено курсов: <strong>{coursesData.total}</strong>
						</p>
					</div>

					{coursesData.total === 0 ? (
						<div className="py-12 text-center">
							<p className="text-gray-500 text-lg dark:text-gray-400">
								По вашему запросу курсы не найдены
							</p>
						</div>
					) : (
						<div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
							{coursesData.courses.map((course) => (
								<CourseCard
									key={course.id}
									id={course.id}
									title={course.title!}
									context={course.description!}
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
