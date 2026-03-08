"use client";

import { Pagination } from "@/components/pagination";
import { useScriptsQuery } from "../../_hooks/useScriptsQuery";

interface PaginationSectionProps {
	currentPage: number;
	totalPages: number;
}

// TODO: refactor pagination to hook and shadcn/ui
export function PaginationSection({
	currentPage,
	totalPages,
}: PaginationSectionProps) {
	const { isPending, setPage } = useScriptsQuery();

	if (totalPages <= 1) return null;

	return (
		<Pagination
			currentPage={currentPage}
			totalPages={totalPages}
			onPageChange={setPage}
			isLoading={isPending}
		/>
	);
}
