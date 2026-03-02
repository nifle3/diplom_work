import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { CategoriesTable, type CategoryRow } from "./categories-table";
import { CategoryForm } from "./category-form";

const mockCategories: CategoryRow[] = [
	{ id: "1", name: "IT", description: "Вопросы для IT специалистов" },
	{ id: "2", name: "Маркетинг", description: "Вопросы для маркетологов" },
	{ id: "3", name: "Финансы", description: "Вопросы для финансистов" },
];

export default function CategoriesPage() {
	const refetch = () => {
		console.log("Refetch categories");
	};

	return (
		<div className="container mx-auto p-6">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="font-bold text-2xl">Категории</h1>
				<Dialog>
					<DialogTrigger>
						<Button>
							<Plus className="mr-2 h-4 w-4" />
							Добавить категорию
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Добавить категорию</DialogTitle>
						</DialogHeader>
						<CategoryForm category={undefined} onSuccess={refetch} />
					</DialogContent>
				</Dialog>
			</div>
			<CategoriesTable data={mockCategories} refetch={refetch} />
		</div>
	);
}
