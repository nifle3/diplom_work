"use client";

import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";

interface CategoriesFilterProps {
	categories: Array<{ id: string; name: string }>;
	selectedCategory: string | undefined;
	onSelectCategory: (categoryId: string | undefined) => void;
	isLoading?: boolean;
}

export function CategoriesFilter({
	categories,
	selectedCategory,
	onSelectCategory,
	isLoading,
}: CategoriesFilterProps) {
	return (
		<div className="space-y-4">
			<h3 className="font-semibold text-sm">Категории</h3>

			<div className="space-y-3" role="group" aria-label="Фильтр по категориям">
				{/* Показать все */}
				<div className="flex items-center space-x-2">
					<Checkbox
						id="category-all"
						checked={!selectedCategory}
						onCheckedChange={(checked) => {
							if (checked) {
								onSelectCategory(undefined);
							}
						}}
						disabled={isLoading}
						aria-label="Показать все курсы"
					/>
					<Label htmlFor="category-all" className="cursor-pointer font-normal">
						Все курсы
					</Label>
				</div>

				{/* Категории */}
				{categories.map((category) => (
					<div key={category.id} className="flex items-center space-x-2">
						<Checkbox
							id={`category-${category.id}`}
							checked={selectedCategory === category.id}
							onCheckedChange={(checked) => {
								if (checked) {
									onSelectCategory(category.id);
								} else {
									onSelectCategory(undefined);
								}
							}}
							disabled={isLoading}
						/>
						<Label
							htmlFor={`category-${category.id}`}
							className="cursor-pointer font-normal"
						>
							{category.name}
						</Label>
					</div>
				))}
			</div>
		</div>
	);
}
