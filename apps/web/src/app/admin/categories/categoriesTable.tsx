"use client";

import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";


import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { CategoryForm } from "./categoryForm";
import Modal from "@/components/modal";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";

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
						<DialogTrigger>
							<Button variant="ghost" size="icon">
								<Pencil className="h-4 w-4" />
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Редактировать категорию</DialogTitle>
							</DialogHeader>
							<CategoryForm category={row.original}/>
						</DialogContent>
					</Dialog>
					<Modal 
						header={"Удалить категорию"} 
						description={`Вы уверены, что хотите удалить категорию "${categoryName}"? Это
									действие нельзя отменить.`} 
						actionName={"Удалить"} 
						action={() => onDelete(row.original.id)}
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
	const [mounted, setMounted] = useState(false);

	const router = useRouter();
	const deleteMutation = useMutation(trpc.category.deleteById.mutationOptions({
		onError: (error) => {
			toast(error.message);
		},
		onSuccess: () => {
			router.refresh();
		}
	}));

	useEffect(() => {
		setMounted(true);
	}, []);

	const onDelete = async (id: number) => {
		await deleteMutation.mutateAsync(id);
	};

	const table = useReactTable({
		data,
		columns: defaultColumns(onDelete),
		getCoreRowModel: getCoreRowModel(),
	});

	if (!mounted || deleteMutation.isPending) {
		return (
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Название</TableHead>
						<TableHead>Действия</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{Array.from({ length: 3 }).map((_, i) => (
						<TableRow key={`skeleton-row-${i}`}>
							<TableCell>
								<Skeleton className="h-4 w-32" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-48" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-8 w-16" />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		);
	}

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
						<TableCell colSpan={3} className="h-24 text-center">
							Нет данных
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
}
