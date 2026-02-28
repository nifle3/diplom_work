"use client";

import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

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
}

const defaultColumns: ColumnDef<ScriptRow>[] = [
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
			return (
				<div className="flex gap-2">
					<Link href={linkProps}>
						<Button variant="ghost" size="icon">
							<Pencil className="h-4 w-4" />
						</Button>
					</Link>
					<Button variant="ghost" size="icon">
						<Trash2 className="h-4 w-4 text-destructive" />
					</Button>
				</div>
			);
		},
	},
];

export function SharedScriptsTable({
	data,
	columns = defaultColumns,
}: SharedTableProps) {
	const table = useReactTable({
		data,
		columns,
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
						<TableCell colSpan={columns.length} className="h-24 text-center">
							Нет данных
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
}
