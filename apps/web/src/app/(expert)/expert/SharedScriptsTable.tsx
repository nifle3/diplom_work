"use client";

import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

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
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

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
	onDelete?: (id: string) => void;
}

const defaultColumns = (
	onDelete: (id: string) => void,
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
			const href = `/constructor/${row.original.id}/firstStep`;
			// biome-ignore lint/suspicious/noExplicitAny: Needed for Next.js Link type compatibility
			const linkProps = href as any;
			const scriptTitle = row.original.title ?? "Без названия";
			return (
				<div className="flex gap-2">
					<Link href={linkProps}>
						<Button variant="ghost" size="icon">
							<Pencil className="h-4 w-4" />
						</Button>
					</Link>
					<AlertDialog>
						<AlertDialogTrigger>
							<Button variant="ghost" size="icon">
								<Trash2 className="h-4 w-4 text-destructive" />
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Удалить сценарий</AlertDialogTitle>
								<AlertDialogDescription>
									Вы уверены, что хотите удалить сценарий "{scriptTitle}"? Это
									действие нельзя отменить.
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

export function SharedScriptsTable({
	data,
	columns,
}: SharedTableProps) {
	const deleteScript = useMutation(trpc.createScript.deleteScript.mutationOptions({
		onSuccess: () => {
			toast("Удаление успешно");
		},
		onError: () => {
			toast("Удаление не успешно");
		}
	}));

	const onDelete = async (scriptId: string) => {
		await deleteScript.mutateAsync(scriptId);
	}

	const table = useReactTable({
		data,
		columns: columns ?? defaultColumns(onDelete),
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
						<TableCell colSpan={columns?.length} className="h-24 text-center">
							Нет данных
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
}
