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

export interface ScriptRow {
	id: string;
	title: string | null;
	context: string | null;
	categoryName: string | null;
	createdAt: Date | null;
}

interface SharedTableProps {
	data: ScriptRow[];
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
		cell: ({ row }) => {
			if (isDraftTable) {
				return (
					<span className="font-medium">
						{row.original.title ?? "Без названия"}
					</span>
				);
			}

			return (
				<Link
					className="font-medium"
					href={{ pathname: `/script/${row.original.id}` }}
				>
					{row.original.title ?? "Без названия"}
				</Link>
			);
		},
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
							<Button variant="ghost" size="icon">
								<Upload className="h-4 w-4" />
							</Button>
						</Modal>
					)}
					<Link
						href={{ pathname: `/createScript/${row.original.id}/firstStep` }}
						className="inline-flex size-8 items-center justify-center rounded-none hover:bg-muted"
					>
						<Pencil className="h-4 w-4" />
					</Link>
					<Modal
						header={"Удалить сценарий"}
						description={`Вы уверены, что хотите удалить сценарий ${scriptTitle}? Это
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

export function SharedScriptsTable({ data, isDraftTable }: SharedTableProps) {
	const router = useRouter();

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

	const publishScript = useMutation(
		trpc.createScript.postDraft.mutationOptions({
			onSuccess: () => {
				toast("Опубликовано");
				router.refresh();
			},
			onError: (error) => {
				toast(error.message);
			},
		}),
	);

	const onDelete = async (scriptId: string) => {
		await deleteScript.mutateAsync(scriptId);
	};

	const onPublish = async (scriptId: string) => {
		await publishScript.mutateAsync(scriptId);
	};

	const table = useReactTable({
		data,
		columns: defaultColumns(onDelete, onPublish, isDraftTable),
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
						<TableCell className="h-24 text-center">Нет данных</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
}
