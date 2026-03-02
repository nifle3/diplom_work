import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { ExpertForm } from "./_components/expertForm";
import { ExpertsTable } from "./_components/expertsTable";
import { serverTrpc } from "@/lib/trpcServer";

export default async function ExpertsPage() {
	const trpcCaller = await serverTrpc();
	const data = await trpcCaller.expertManager.getAll();

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
						<ExpertForm/>
					</DialogContent>
				</Dialog>
			</div>
			<ExpertsTable data={data}/>
		</div>
	);
}
