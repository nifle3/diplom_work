"use client";

import { CategoriesFilter } from "@/components/courses-filter";
import { SearchCourses } from "@/components/search-courses";
import { useScriptsQuery } from "../../_hooks/useScriptsQuery";

interface ScriptsFiltersProps {
  categories: { id: number; name: string }[];
}

export function ScriptsFilters({ categories }: ScriptsFiltersProps) {
  const { isPending, setSearch, setCategory, currentParams } = useScriptsQuery();

  return (
    <div className="space-y-6">
      <SearchCourses
        onSearch={setSearch}
        isLoading={isPending}
        defaultValue={currentParams.search}
      />
      <CategoriesFilter
        categories={categories}
        selectedCategory={currentParams.categoryId}
        onSelectCategory={setCategory}
        isLoading={isPending}
      />
    </div>
  );
}
