"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	isLoading?: boolean;
}

export function Pagination({
	currentPage,
	totalPages,
	onPageChange,
	isLoading,
}: PaginationProps) {
	if (totalPages <= 1) {
		return null;
	}

	const getPageNumbers = () => {
		const pages = [];
		const maxVisible = 7;
		let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
		const endPage = Math.min(totalPages, startPage + maxVisible - 1);

		if (endPage - startPage < maxVisible - 1) {
			startPage = Math.max(1, endPage - maxVisible + 1);
		}

		if (startPage > 1) {
			pages.push(1);
			if (startPage > 2) {
				pages.push("...");
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			pages.push(i);
		}

		if (endPage < totalPages) {
			if (endPage < totalPages - 1) {
				pages.push("...");
			}
			pages.push(totalPages);
		}

		return pages;
	};

	return (
		<div className="mt-12 flex items-center justify-center gap-2">
			<Button
				variant="outline"
				size="sm"
				onClick={() => onPageChange(currentPage - 1)}
				disabled={currentPage === 1 || isLoading}
				aria-label="Предыдущая страница"
			>
				<ChevronLeft className="h-4 w-4" />
			</Button>

			{getPageNumbers().map((page, index) => {
				if (page === "...") {
					return (
						<span key={`ellipsis-${index}`} className="px-2">
							...
						</span>
					);
				}

				return (
					<Button
						key={page}
						variant={currentPage === page ? "default" : "outline"}
						size="sm"
						onClick={() => onPageChange(page as number)}
						disabled={isLoading}
						aria-current={currentPage === page ? "page" : undefined}
					>
						{page}
					</Button>
				);
			})}

			<Button
				variant="outline"
				size="sm"
				onClick={() => onPageChange(currentPage + 1)}
				disabled={currentPage === totalPages || isLoading}
				aria-label="Следующая страница"
			>
				<ChevronRight className="h-4 w-4" />
			</Button>
		</div>
	);
}
