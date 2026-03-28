"use client";

import { useMutation } from "@tanstack/react-query";
import {
	type ColumnDef,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { GeneralTable } from "@/components/generalTable";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { CategoryForm } from "./categoryForm";

export interface CategoryRow {
	id: number;
	name: string;
}

interface CategoriesTableProps {
	data: CategoryRow[];
}

const defaultColumns = (
	onDelete: (id: number) => void,
): ColumnDef<CategoryRow>[] => [
	{
		accessorKey: "name",
		header: "Название",
		cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
	},
	{
		id: "actions",
		header: "Действия",
		cell: ({ row }) => {
			const categoryName = row.original.name;
			return (
				<div className="flex gap-2">
					<Dialog>
						<DialogTrigger asChild>
							<Button variant="ghost" size="icon">
								<Pencil className="h-4 w-4" />
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Редактировать категорию</DialogTitle>
							</DialogHeader>
							<CategoryForm category={row.original} />
						</DialogContent>
					</Dialog>
					<Modal
						header={"Удалить категорию"}
						description={`Вы уверены, что хотите удалить категорию "${categoryName}"? Это
									действие нельзя отменить.`}
						actionName={"Удалить"}
						action={() => onDelete(row.original.id)}
						asChild={true}
					>
						<Button variant="ghost" size="icon">
							<Trash2 className="h-4 w-4 text-destructive" />
						</Button>
					</Modal>
				</div>
			);
		},
	},
];

export function CategoriesTable({ data }: CategoriesTableProps) {
	const router = useRouter();
	const deleteMutation = useMutation(
		trpc.category.deleteById.mutationOptions({
			onMutate: () => {
				router.refresh();
			},
		}),
	);

	const onDelete = async (id: number) => {
		await deleteMutation.mutateAsync(id);
	};

	const table = useReactTable({
		data,
		columns: defaultColumns(onDelete),
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<GeneralTable
			headerGroups={table.getHeaderGroups()}
			rows={table.getRowModel().rows}
		/>
	);
}
