"use client";

import { useMutation } from "@tanstack/react-query";
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";

export interface ExpertRow {
	id: string;
	name: string;
	email: string;
}

interface ExpertsTableProps {
	data: ExpertRow[];
}

const defaultColumns = (
	onDelete: (id: string) => void,
): ColumnDef<ExpertRow>[] => [
	{
		accessorKey: "name",
		header: "Имя",
		cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
	},
	{
		accessorKey: "email",
		header: "Email",
		cell: ({ row }) => row.original.email,
	},
	{
		id: "actions",
		header: "Действия",
		cell: ({ row }) => {
			const expertName = row.original.name;
			const expertEmail = row.original.email;
			return (
				<div className="flex gap-2">
					<Modal
						header={"Удалить эксперта"}
						description={`Вы уверены, что хотите удалить эксперта ${expertName} (
									${expertEmail})? Это действие нельзя отменить.`}
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

export function ExpertsTable({ data }: ExpertsTableProps) {
	const router = useRouter();
	const deleteMutation = useMutation(
		trpc.expertManager.unsetUserExpert.mutationOptions({
			onSuccess: () => {
				toast("Эксперт удалён");
				router.refresh();
			},
		}),
	);
	const onDelete = async (id: string) => {
		await deleteMutation.mutateAsync(id);
	};

	const table = useReactTable({
		data,
		columns: defaultColumns(onDelete),
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<Table>
			<TableHeader>
				{table.getHeaderGroups().map((headerGroup) => (
					<TableRow key={headerGroup.id}>
						{headerGroup.headers.map((header) => (
							<TableHead key={header.id}>
								{header.isPlaceholder
									? null
									: flexRender(
											header.column.columnDef.header,
											header.getContext(),
										)}
							</TableHead>
						))}
					</TableRow>
				))}
			</TableHeader>
			<TableBody>
				{table.getRowModel().rows?.length ? (
					table.getRowModel().rows.map((row) => (
						<TableRow key={row.id}>
							{row.getVisibleCells().map((cell) => (
								<TableCell key={cell.id}>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</TableCell>
							))}
						</TableRow>
					))
				) : (
					<TableRow>
						<TableCell colSpan={4} className="h-24 text-center">
							Нет данных
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
}
