"use client";

import { Search, X } from "lucide-react";
import { type ChangeEvent, type KeyboardEvent, useCallback, useState } from "react";

import { Input } from "@/components/ui/input";
import { useScriptsQuery } from "../../_hooks/useScriptsQuery";


// TODO: поправить кривые иконки
export function SearchCourses() {
	const { isPending, currentParams, setSearch } = useScriptsQuery();
	const [query, setQuery] = useState(currentParams.search || "");

	const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setQuery(e.target.value);
	}, []);

	const handleKeyDown = useCallback(
		(e: KeyboardEvent<HTMLInputElement>) => {
			if (e.key === "Enter") {
				setSearch(query);
			}
		},
		[query, setSearch],
	);

	const handleClear = useCallback(() => {
		setQuery("");
		setSearch("");
	}, [setSearch]);

	return (
		<div className="relative">
			<Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
			<Input
				type="text"
				placeholder="Поиск курсов..."
				value={query}
				onChange={handleChange}
				onKeyDown={handleKeyDown}
				disabled={isPending}
				className="pr-10 pl-10"
			/>
			{query && (
				<button
					type="button"
					onClick={handleClear}
					disabled={isPending}
					className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
					aria-label="Очистить поиск"
				>
					<X className="h-4 w-4" />
				</button>
			)}
		</div>
	);
}