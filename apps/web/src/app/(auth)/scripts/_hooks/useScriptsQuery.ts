"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export function useScriptsQuery() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { 0: isPending, 1: startTransition } = useTransition();

	const updateQuery = (
		updates: Record<string, string | undefined>,
		shouldResetPage = true,
	) => {
		const params = new URLSearchParams(searchParams.toString());

		Object.entries(updates).forEach(([key, value]) => {
			if (!value) {
				params.delete(key);
			} else {
				params.set(key, value);
			}
		});

		if (shouldResetPage && (updates.search || updates.categoryId)) {
			params.set("page", "1");
		}

		startTransition(() => {
			router.push(`?${params.toString()}`, { scroll: false });
		});
	};

	const setPage = (page: number) =>
		updateQuery({ page: page.toString() }, false);
	const setSearch = (search: string) => updateQuery({ search });
	const setCategory = (categoryId: string | undefined) =>
		updateQuery({ categoryId });

	return {
		isPending,
		setPage,
		setSearch,
		setCategory,
		currentParams: {
			page: searchParams.get("page") || "1",
			categoryId: searchParams.get("categoryId") || undefined,
			search: searchParams.get("search") || "",
		},
	};
}
