"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { CategoriesFilter } from "@/components/courses-filter";
import { Pagination } from "@/components/pagination";
import { SearchCourses } from "@/components/search-courses";

interface ScriptsFiltersProps {
	categories: { id: number; name: string }[];
	currentPage: number;
	currentCategoryId?: string;
	currentSearch?: string;
	totalPages: number;
}

export function ScriptsFilters({
	categories,
	currentPage,
	currentCategoryId,
	currentSearch,
	totalPages,
}: ScriptsFiltersProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const updateQueryParams = (updates: Record<string, string | undefined>) => {
		const params = new URLSearchParams();

		if (currentSearch) params.set("search", currentSearch);
		if (currentCategoryId) params.set("categoryId", currentCategoryId);
		params.set("page", currentPage.toString());

		Object.entries(updates).forEach(([key, value]) => {
			if (value === undefined || value === "") {
				params.delete(key);
			} else {
				params.set(key, value);
			}
		});

		if (updates.search !== undefined || updates.categoryId !== undefined) {
			params.set("page", "1");
		}

		startTransition(() => {
			router.push(`?${params.toString()}`);
		});
	};

	const handlePageChange = (newPage: number) => {
		updateQueryParams({ page: newPage.toString() });
	};

	const handleSearch = (query: string) => {
		updateQueryParams({ search: query || undefined });
	};

	const handleCategoryChange = (newCategoryId: string | undefined) => {
		updateQueryParams({ categoryId: newCategoryId });
	};

	return (
		<>
			<div className="sticky top-20 space-y-6">
				<SearchCourses onSearch={handleSearch} isLoading={isPending} />
				<CategoriesFilter
					categories={categories}
					selectedCategory={currentCategoryId}
					onSelectCategory={handleCategoryChange}
					isLoading={isPending}
				/>
			</div>

			<Pagination
				currentPage={currentPage}
				totalPages={totalPages}
				onPageChange={handlePageChange}
				isLoading={isPending}
			/>
		</>
	);
}
