"use client";

import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { ExpertForm } from "./expertForm";

export interface ExpertRow {
	id: string;
	name: string;
	email: string;
	isActive: boolean;
}

interface ExpertsTableProps {
	data: ExpertRow[];
	refetch: () => void;
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
		accessorKey: "isActive",
		header: "Статус",
		cell: ({ row }) => (
			<span
				className={row.original.isActive ? "text-green-600" : "text-red-600"}
			>
				{row.original.isActive ? "Активен" : "Неактивен"}
			</span>
		),
	},
	{
		id: "actions",
		header: "Действия",
		cell: ({ row }) => {
			const expertName = row.original.name;
			const expertEmail = row.original.email;
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
								<DialogTitle>Редактировать эксперта</DialogTitle>
							</DialogHeader>
							<ExpertForm expert={row.original} onSuccess={() => {}} />
						</DialogContent>
					</Dialog>
					<AlertDialog>
						<AlertDialogTrigger>
							<Button variant="ghost" size="icon">
								<Trash2 className="h-4 w-4 text-destructive" />
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Удалить эксперта</AlertDialogTitle>
								<AlertDialogDescription>
									Вы уверены, что хотите удалить эксперта {expertName} (
									{expertEmail})? Это действие нельзя отменить.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Отмена</AlertDialogCancel>
								<AlertDialogAction onClick={() => onDelete(row.original.id)}>
									Удалить
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			);
		},
	},
];

export function ExpertsTable({ data, refetch }: ExpertsTableProps) {
	const router = useRouter();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const onDelete = async (expertId: string) => {
		try {
			toast("Эксперт удален");
			refetch();
		} catch {
			toast("Ошибка при удалении");
		}
	};

	const table = useReactTable({
		data,
		columns: defaultColumns(onDelete),
		getCoreRowModel: getCoreRowModel(),
	});

	if (!mounted) {
		return (
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Имя</TableHead>
						<TableHead>Email</TableHead>
						<TableHead>Статус</TableHead>
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
								<Skeleton className="h-4 w-20" />
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
						<TableCell colSpan={4} className="h-24 text-center">
							Нет данных
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
}
