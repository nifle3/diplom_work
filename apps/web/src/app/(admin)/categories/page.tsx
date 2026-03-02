import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { CategoriesTable } from "./categoriesTable";
import { CategoryForm } from "./categoryForm";
import { serverTrpc } from "@/lib/trpcServer";

export default async function CategoriesPage() {
	const trpcCaller = await serverTrpc();
	const data = await trpcCaller.category.getAll();

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
						<CategoryForm category={undefined} />
					</DialogContent>
				</Dialog>
			</div>
			<CategoriesTable data={data}/>
		</div>
	);
}
