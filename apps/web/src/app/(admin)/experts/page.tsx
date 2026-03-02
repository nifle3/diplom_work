import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { ExpertForm } from "./expert-form";
import { type ExpertRow, ExpertsTable } from "./experts-table";

const mockExperts: ExpertRow[] = [
	{ id: "1", name: "Иван Иванов", email: "ivan@example.com", isActive: true },
	{ id: "2", name: "Петр Петров", email: "petr@example.com", isActive: true },
	{
		id: "3",
		name: "Сидор Сидоров",
		email: "sidor@example.com",
		isActive: false,
	},
];

export default function ExpertsPage() {
	const refetch = () => {
		console.log("Refetch experts");
	};

	return (
		<div className="container mx-auto p-6">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="font-bold text-2xl">Эксперты</h1>
				<Dialog>
					<DialogTrigger>
						<Button>
							<Plus className="mr-2 h-4 w-4" />
							Добавить эксперта
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Добавить эксперта</DialogTitle>
						</DialogHeader>
						<ExpertForm expert={undefined} onSuccess={refetch} />
					</DialogContent>
				</Dialog>
			</div>
			<ExpertsTable data={mockExperts} refetch={refetch} />
		</div>
	);
}
