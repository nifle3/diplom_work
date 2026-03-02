"use client";

import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	Calendar,
	CheckCircle2,
	ChevronRight,
	Clock,
	MessageSquare,
	XCircle,
} from "lucide-react";
import Link from "next/link";

interface HistoryRow {
	id: string;
	status: string;
	finalScore: number | null;
	expertFeedback: string | null;
	startedAt: Date | string | null;
	finishedAt: Date | string | null;
	script: {
		id: string;
		title: string | null;
	} | null;
}

interface MyHistoryTableProps {
	data: HistoryRow[];
	isLoading?: boolean;
}

const statusMap = {
	in_progress: {
		label: "В процессе",
		icon: Clock,
		color: "text-blue-500",
		bg: "bg-blue-50 dark:bg-blue-950",
	},
	completed: {
		label: "Завершено",
		icon: CheckCircle2,
		color: "text-green-500",
		bg: "bg-green-50 dark:bg-green-950",
	},
	cancelled: {
		label: "Отменено",
		icon: XCircle,
		color: "text-red-500",
		bg: "bg-red-50 dark:bg-red-950",
	},
};

const columns: ColumnDef<HistoryRow>[] = [
	{
		accessorKey: "script.title",
		header: "Сценарий",
		cell: ({ row }) => (
			<span className="font-medium">{row.original.script?.title ?? "—"}</span>
		),
	},
	{
		accessorKey: "status",
		header: "Статус",
		cell: ({ row }) => {
			const status = statusMap[row.original.status as keyof typeof statusMap];
			const Icon = status.icon;
			return (
				<div
					className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium text-xs ${status.bg} ${status.color}`}
				>
					<Icon className="h-3.5 w-3.5" />
					{status.label}
				</div>
			);
		},
	},
	{
		accessorKey: "finalScore",
		header: "Оценка",
		cell: ({ row }) => {
			const score = row.original.finalScore;
			if (score === null)
				return <span className="text-muted-foreground">—</span>;

			let scoreColor = "text-muted-foreground";
			if (score >= 80) scoreColor = "text-green-600 dark:text-green-400";
			else if (score >= 60) scoreColor = "text-yellow-600 dark:text-yellow-400";
			else if (score >= 40) scoreColor = "text-orange-600 dark:text-orange-400";
			else scoreColor = "text-red-600 dark:text-red-400";

			return <span className={`font-semibold ${scoreColor}`}>{score}%</span>;
		},
	},
	{
		accessorKey: "startedAt",
		header: "Дата",
		cell: ({ row }) => {
			const date = row.original.startedAt;
			if (!date) return <span className="text-muted-foreground">—</span>;
			return (
				<div className="flex items-center gap-1.5 text-muted-foreground">
					<Calendar className="h-4 w-4" />
					{new Date(date).toLocaleDateString("ru-RU", {
						day: "numeric",
						month: "short",
						year: "numeric",
					})}
				</div>
			);
		},
	},
	{
		id: "actions",
		header: "",
		cell: ({ row }) => {
			if (row.original.status !== "completed") return null;
			return (
				<Link
					href={`/interview/${row.original.id}/results`}
					className="inline-flex items-center gap-1 font-medium text-sm text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
				>
					Подробнее
					<ChevronRight className="h-4 w-4" />
				</Link>
			);
		},
	},
];

export default function MyHistoryTable({
	data,
	isLoading,
}: MyHistoryTableProps) {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	if (isLoading) {
		return (
			<div className="rounded-xl border bg-card shadow-sm">
				<div className="border-b">
					<div className="grid grid-cols-5 gap-4 p-4">
						{Array.from({ length: 5 }).map((_, i) => (
							<div
								key={`header-${i}`}
								className="h-5 animate-pulse rounded bg-muted"
							/>
						))}
					</div>
				</div>
				<div className="divide-y">
					{Array.from({ length: 5 }).map((_, i) => (
						<div key={`row-${i}`} className="grid grid-cols-5 gap-4 p-4">
							{Array.from({ length: 5 }).map((_, j) => (
								<div
									key={`cell-${i}-${j}`}
									className="h-5 animate-pulse rounded bg-muted"
								/>
							))}
						</div>
					))}
				</div>
			</div>
		);
	}

	if (!data || data.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16 shadow-sm">
				<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
					<MessageSquare className="h-8 w-8 text-muted-foreground" />
				</div>
				<h3 className="mb-1 font-semibold text-lg">Нет истории интервью</h3>
				<p className="text-muted-foreground text-sm">
					Начните проходить интервью, чтобы увидеть их здесь
				</p>
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-xl border bg-card shadow-sm">
			<table className="w-full">
				<thead>
					{table.getHeaderGroups().map((headerGroup) => (
						<tr key={headerGroup.id} className="border-b bg-muted/30">
							{headerGroup.headers.map((header) => (
								<th
									key={header.id}
									className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider"
								>
									{header.isPlaceholder
										? null
										: flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)}
								</th>
							))}
						</tr>
					))}
				</thead>
				<tbody className="divide-y">
					{table.getRowModel().rows.map((row) => (
						<tr key={row.id} className="transition-colors hover:bg-muted/50">
							{row.getVisibleCells().map((cell) => (
								<td key={cell.id} className="px-4 py-4">
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
