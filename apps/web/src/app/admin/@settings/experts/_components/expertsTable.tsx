"use client";

import { useMutation } from "@tanstack/react-query";
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
import { Modal } from "@/components/modal";
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
import { trpc } from "@/lib/trpc";
import { ExpertForm } from "../expertForm";

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
			onError: (error) => {
				toast(error.message);
			},
		}),
	);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const onDelete = async (id: string) => {
		await deleteMutation.mutateAsync(id);
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
