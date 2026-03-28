"use client";

import {
	type ColumnDef,
	type ColumnFiltersState,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import {
	ArrowUpDown,
	Calendar,
	CheckCircle2,
	ChevronRight,
	Clock,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { GeneralTable } from "@/components/generalTable";
import { Button } from "@/components/ui/button";

type HistoryRow = {
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
};

type MyHistoryTableProps = {
	data: HistoryRow[];
};

const statusMap = {
	active: {
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

type HistoryStatus = keyof typeof statusMap;

const statusEntries = Object.entries(statusMap) as [
	HistoryStatus,
	(typeof statusMap)[HistoryStatus],
][];

function normalizeHistoryStatus(status: string): HistoryStatus | string {
	if (status === "in_progress") return "active";
	if (status === "incomplete") return "active";
	return status;
}

function getPassageTimestamp(row: HistoryRow) {
	const date = row.finishedAt ?? row.startedAt;
	if (!date) return 0;

	const timestamp = new Date(date).getTime();
	return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getStatusMeta(status: string) {
	const normalizedStatus = normalizeHistoryStatus(status);

	return (
		statusMap[normalizedStatus as HistoryStatus] ?? {
			label: status,
			icon: Clock,
			color: "text-muted-foreground",
			bg: "bg-muted",
		}
	);
}

const columns: ColumnDef<HistoryRow>[] = [
	{
		accessorKey: "script.title",
		header: "Сценарий",
		cell: ({ row }) => (
			<span className="font-medium">{row.original.script?.title ?? "—"}</span>
		),
	},
	{
		accessorFn: (row) => normalizeHistoryStatus(row.status),
		id: "status",
		header: "Статус",
		filterFn: "equalsString",
		cell: ({ row }) => {
			const status = getStatusMeta(row.original.status);
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
		id: "passageDate",
		accessorFn: getPassageTimestamp,
		header: ({ column }) => {
			const isSorted = column.getIsSorted();

			return (
				<Button
					type="button"
					variant="ghost"
					size="xs"
					className="-ml-2 h-8 justify-start px-2"
					onClick={() => column.toggleSorting(isSorted === "asc")}
				>
					Дата прохождения
					<ArrowUpDown className="h-3.5 w-3.5" />
				</Button>
			);
		},
		cell: ({ row }) => {
			const date = row.original.finishedAt ?? row.original.startedAt;
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
			if (row.original.status !== "complete") return null;
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

export function HistoryScriptTable({ data }: MyHistoryTableProps) {
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "passageDate", desc: true },
	]);

	const activeStatusFilter = columnFilters.find((f) => f.id === "status")
		?.value as HistoryStatus | undefined;

	function setActiveStatusFilter(status: HistoryStatus | undefined) {
		setColumnFilters(status ? [{ id: "status", value: status }] : []);
	}

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		state: {
			sorting,
			columnFilters,
		},
	});

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm lg:flex-row lg:items-end lg:justify-between">
				<div className="space-y-3">
					<div className="font-medium text-muted-foreground text-sm">
						Статус
					</div>
					<div className="flex flex-wrap gap-2">
						<Button
							type="button"
							variant={activeStatusFilter ? "outline" : "default"}
							size="sm"
							onClick={() => setActiveStatusFilter(undefined)}
						>
							Все
						</Button>
						{statusEntries.map(([status, meta]) => (
							<Button
								key={status}
								type="button"
								variant={activeStatusFilter === status ? "default" : "outline"}
								size="sm"
								onClick={() => setActiveStatusFilter(status)}
							>
								<meta.icon className="h-3.5 w-3.5" />
								{meta.label}
							</Button>
						))}
					</div>
				</div>
			</div>
			<div className="overflow-hidden rounded-xl border bg-card shadow-sm">
				<GeneralTable
					headerGroups={table.getHeaderGroups()}
					rows={table.getRowModel().rows}
				/>
			</div>
		</div>
	);
}
