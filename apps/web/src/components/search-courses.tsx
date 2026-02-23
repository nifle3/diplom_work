"use client";

import { useCallback, useState } from "react";
import { Input } from "./ui/input";
import { Search, X } from "lucide-react";

interface SearchCoursesProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export function SearchCourses({ onSearch, isLoading }: SearchCoursesProps) {
  const [query, setQuery] = useState("");

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      onSearch(value);
    },
    [onSearch]
  );

  const handleClear = useCallback(() => {
    setQuery("");
    onSearch("");
  }, [onSearch]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
      <Input
        type="text"
        placeholder="Поиск курсов..."
        value={query}
        onChange={handleChange}
        disabled={isLoading}
        className="pl-10 pr-8"
      />
      {query && (
        <button
          onClick={handleClear}
          disabled={isLoading}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Очистить поиск"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
