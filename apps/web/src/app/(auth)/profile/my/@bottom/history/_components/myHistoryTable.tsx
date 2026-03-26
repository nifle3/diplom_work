"use client";

import {
	type ColumnDef,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	Calendar,
	CheckCircle2,
	ChevronRight,
	Clock,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { GeneralTable } from "@/components/generalTable";

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
	complete: {
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

export function MyHistoryTable({ data }: MyHistoryTableProps) {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div className="overflow-hidden rounded-xl border bg-card shadow-sm">
			<GeneralTable table={table} />
		</div>
	);
}
