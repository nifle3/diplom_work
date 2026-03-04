"use client";

import { Search, X } from "lucide-react";
import { useCallback, useState, type ChangeEvent } from "react";

import { Input } from "@/components/ui/input";

interface SearchCoursesProps {
	onSearch: (query: string) => void;
	isLoading?: boolean;
	defaultValue?: string;
}

export function SearchCourses({ onSearch, isLoading, defaultValue }: SearchCoursesProps) {
	const [query, setQuery] = useState(defaultValue || "");

	const handleChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value;
			setQuery(value);
			onSearch(value);
		},
		[onSearch],
	);

	const handleClear = useCallback(() => {
		setQuery("");
		onSearch("");
	}, [onSearch]);

	return (
		<div className="relative">
			<Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
			<Input
				type="text"
				placeholder="Поиск курсов..."
				value={query}
				onChange={handleChange}
				disabled={isLoading}
				className="pr-8 pl-10"
			/>
			{query && (
				<button
					onClick={handleClear}
					disabled={isLoading}
					className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
					aria-label="Очистить поиск"
				>
					<X className="h-4 w-4" />
				</button>
			)}
		</div>
	);
}
