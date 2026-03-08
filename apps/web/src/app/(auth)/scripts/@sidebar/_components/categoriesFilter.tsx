"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useScriptsQuery } from "../../_hooks/useScriptsQuery";

type CategoriesFilterProps = {
	categories: Array<{ id: string; name: string }>;
};

export function CategoriesFilter({ categories }: CategoriesFilterProps) {
	const { isPending, currentParams, setCategory } = useScriptsQuery();

	return (
		<div className="space-y-4">
			<h3 className="font-semibold text-sm">Категории</h3>

			<fieldset className="space-y-3" aria-label="Фильтр по категориям">
				<legend>role</legend>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="category-all"
						checked={!currentParams.categoryId}
						onCheckedChange={(checked) => {
							if (checked) {
								setCategory(undefined);
							}
						}}
						disabled={isPending}
						aria-label="Показать все курсы"
					/>
					<Label htmlFor="category-all" className="cursor-pointer font-normal">
						Все курсы
					</Label>
				</div>

				{categories.map((category) => (
					<div key={category.id} className="flex items-center space-x-2">
						<Checkbox
							id={`category-${category.id}`}
							checked={currentParams.categoryId === category.id}
							onCheckedChange={(checked) => {
								if (checked) {
									setCategory(category.id);
								} else {
									setCategory(undefined);
								}
							}}
							disabled={isPending}
						/>
						<Label
							htmlFor={`category-${category.id}`}
							className="cursor-pointer font-normal"
						>
							{category.name}
						</Label>
					</div>
				))}
			</fieldset>
		</div>
	);
}
