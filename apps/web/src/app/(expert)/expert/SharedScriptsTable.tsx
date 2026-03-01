"use client";

import { useMutation } from "@tanstack/react-query";
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Pencil, Trash2, Upload } from "lucide-react";
import Link from "next/link";
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
import Modal from "@/components/modal";

export interface ScriptRow {
	id: string;
	title: string | null;
	context: string | null;
	categoryName: string | null;
	createdAt: Date | null;
}

interface SharedTableProps {
	data: ScriptRow[];
	columns?: ColumnDef<ScriptRow>[];
	isDraftTable?: boolean;
}

const defaultColumns = (
	onDelete: (id: string) => void,
	onPublish: (id: string) => void,
	isDraftTable?: boolean,
): ColumnDef<ScriptRow>[] => [
	{
		accessorKey: "title",
		header: "Название",
		cell: ({ row }) => (
			<span className="font-medium">
				{row.original.title ?? "Без названия"}
			</span>
		),
	},
	{
		accessorKey: "categoryName",
		header: "Категория",
		cell: ({ row }) => row.original.categoryName ?? "—",
	},
	{
		accessorKey: "createdAt",
		header: "Дата создания",
		cell: ({ row }) => {
			const date = row.original.createdAt;
			if (!date) return "—";
			return new Intl.DateTimeFormat("ru-RU", {
				dateStyle: "medium",
			}).format(date);
		},
	},
	{
		id: "actions",
		header: "Действия",
		cell: ({ row }) => {
			const scriptTitle = row.original.title ?? "Без названия";
			return (
				<div className="flex gap-2">
					{isDraftTable && (
						<Modal
							header={"Опубликовать сценарий"} 
							description={`Вы хотите сделать сценарий ${row.original.title} публичным?`} 
							actionName={"Опубликовать"}  
							action={() => onPublish(row.original.id)}
						>
							<Button
							variant="ghost"
							size="icon">
								<Upload className="h-4 w-4" />
							</Button>
						</Modal>
					)}
					<Link
						href={`/constructor/${row.original.id}/firstStep`}
						className="inline-flex size-8 items-center justify-center rounded-none hover:bg-muted"
					>
						<Pencil className="h-4 w-4" />
					</Link>
					<Modal 
						header={"Удалить сценарий"} 
						description={
							`Вы уверены, что хотите удалить сценарий ${scriptTitle}? Это
							действие нельзя отменить.`
						} 
						actionName={"Удалить"}
						action={() => onDelete(row.original.id)}>
							<Button variant="ghost" size="icon">
								<Trash2 className="h-4 w-4 text-destructive" />
							</Button>
						</Modal>
				</div>
			);
		},
	},
];

export function SharedScriptsTable({
	data,
	columns,
	isDraftTable,
}: SharedTableProps) {
	const router = useRouter();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const deleteScript = useMutation(
		trpc.createScript.deleteScript.mutationOptions({
			onSuccess: () => {
				toast("Удаление успешно");
				router.refresh();
			},
			onError: () => {
				toast("Удаление не успешно");
			},
		}),
	);

	const publishScript = useMutation(trpc.createScript.postDraft.mutationOptions({
		onSuccess: () => {
			toast("Опубликовано");
			router.refresh();
		},
		onError: (error) => {
			toast(error.message);
		}
	}))

	const onDelete = async (scriptId: string) => {
		await deleteScript.mutateAsync(scriptId);
	};

	const onPublish = async (scriptId: string) => {
		await publishScript.mutateAsync(scriptId);
	};

	const table = useReactTable({
		data,
		columns:
			columns ??
			defaultColumns(onDelete, onPublish, isDraftTable),
		getCoreRowModel: getCoreRowModel(),
	});

	if (!mounted) {
		return (
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Название</TableHead>
						<TableHead>Категория</TableHead>
						<TableHead>Дата создания</TableHead>
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
								<Skeleton className="h-4 w-24" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-28" />
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
						<TableCell colSpan={columns?.length} className="h-24 text-center">
							Нет данных
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
}
