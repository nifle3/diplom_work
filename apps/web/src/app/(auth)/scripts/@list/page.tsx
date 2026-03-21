import { ScriptCard } from "@/components/scriptCard";
import { serverTrpc } from "@/lib/trpcServer";
import { PaginationSection } from "./_components/paginationSection";

type ListProps = {
	searchParams: Promise<{
		page?: string;
		categoryId?: string;
		search?: string;
	}>;
};

export default async function ListSlot({ searchParams }: ListProps) {
	const { page, categoryId, search } = await searchParams;
	const pageInt = Number.parseInt(page || "1", 10) || 1;
	const categoryIdInt = Number.parseInt(categoryId || "1", 10) || 1;

	const trpcCaller = await serverTrpc();
	const coursesData = await trpcCaller.script.list({
		page: pageInt,
		limit: 12,
		categoryId: categoryIdInt,
		search,
	});

	return (
		<div className="flex h-full flex-col">
			<div className="mb-8">
				<h1 className="mb-2 font-bold text-3xl">Все курсы</h1>
				<p className="text-gray-600 dark:text-gray-400">
					Найдено курсов: <strong>{coursesData.total}</strong>
				</p>
			</div>

			{coursesData.total === 0 ? (
				<div className="flex-1 py-12 text-center">
					<p className="text-gray-500 text-lg dark:text-gray-400">
						По вашему запросу курсы не найдены
					</p>
				</div>
			) : (
				<>
					<div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{coursesData.courses.map((course) => (
							<ScriptCard
								key={course.id}
								id={course.id}
								title={course.title ?? ""}
								context={course.description ?? ""}
								categoryName={course.categoryName ?? ""}
								expertName={course.expertName ?? ""}
							/>
						))}
					</div>

					<div className="mt-auto border-t pt-8">
						<PaginationSection
							currentPage={coursesData.page}
							totalPages={coursesData.pages}
						/>
					</div>
				</>
			)}
		</div>
	);
}
