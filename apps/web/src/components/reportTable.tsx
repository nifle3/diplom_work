"use client";

import { useMutation } from "@tanstack/react-query";
import {
	type ColumnDef,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	ChevronDown,
	Eye,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { GeneralTable } from "@/components/generalTable";
import { StatusBadge } from "@/components/statusBadge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/date";
import { type ReportStatus, reportStatuses, statusMeta } from "@/lib/reportStatus";
import { trpc } from "@/lib/trpc";
import { ReportDetailDialog } from "./reportDetailDialog";

type ReportRow = {
	id: string;
	reason: string;
	createdAt: Date | string;
	status: ReportStatus;
	statusUpdatedAt: Date | string;
	reporter: {
		id: string;
		name: string;
		email: string;
	};
	scenario: {
		id: string;
		title: string;
		category: {
			id: number;
			name: string;
		} | null;
		expert: {
			id: string;
			name: string;
		};
	} | null;
};

type ReportTableProps = {
	data: ReportRow[];
	canManage?: boolean;
	showReporter?: boolean;
	emptyMessage?: string;
};

export function ReportTable({
	data,
	canManage = false,
	showReporter = true,
	emptyMessage = "Жалоб пока нет",
}: ReportTableProps) {
	const router = useRouter();
	const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
	const changeStatusMutation = useMutation(
		trpc.report.changeStatus.mutationOptions({
			onSuccess: () => {
				toast.success("Статус жалобы обновлён");
				router.refresh();
			},
		}),
	);

	const columns: ColumnDef<ReportRow>[] = [
		{
			id: "details",
			header: "",
			cell: ({ row }) => (
				<Button
					variant="ghost"
					size="icon"
					onClick={() => setSelectedReportId(row.original.id)}
					aria-label="Подробнее"
				>
					<Eye className="size-4" />
				</Button>
			),
		},
		{
			accessorKey: "scenario.title",
			header: "Курс",
			cell: ({ row }) => {
				const scenario = row.original.scenario;
				if (!scenario) return <span className="text-muted-foreground">—</span>;

				return (
					<div className="space-y-1">
						<Link
							href={{ pathname: `/script/${scenario.id}` }}
							className="font-medium hover:underline"
						>
							{scenario.title}
						</Link>
						<div className="text-muted-foreground text-xs">
							{scenario.category?.name ?? "Без категории"}
						</div>
					</div>
				);
			},
		},
	];

	if (showReporter) {
		columns.push({
			accessorKey: "reporter.name",
			header: "Кто пожаловался",
			cell: ({ row }) => (
				<div className="space-y-1">
					<div className="font-medium">{row.original.reporter.name}</div>
					<div className="text-muted-foreground text-xs">
						{row.original.reporter.email}
					</div>
				</div>
			),
		});
	}

	columns.push(
		{
			accessorKey: "status",
			header: "Статус",
			cell: ({ row }) => (
				<StatusBadge status={row.original.status} />
			),
		},
		{
			accessorKey: "reason",
			header: "Причина",
			cell: ({ row }) => (
				<p className="max-w-xl whitespace-pre-wrap break-words text-muted-foreground text-sm leading-6">
					{row.original.reason}
				</p>
			),
		},
		{
			accessorKey: "createdAt",
			header: "Создано",
			cell: ({ row }) => (
				<div className="text-muted-foreground text-sm">
					{formatDate(row.original.createdAt)}
				</div>
			),
		},
	);

	if (canManage) {
		columns.push({
			id: "actions",
			header: "Действия",
			cell: ({ row }) => {
				const currentStatus = row.original.status;
				const options = reportStatuses.filter(
					(status) => status !== currentStatus,
				);

				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="sm" className="gap-2">
								Сменить статус
								<ChevronDown className="size-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							{options.map((status) => (
								<DropdownMenuItem
									key={status}
									onSelect={async () => {
										await changeStatusMutation.mutateAsync({
											reportId: row.original.id,
											status,
										});
									}}
								>
									{statusMeta[status].label}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		});
	}

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<>
			<div className="overflow-hidden rounded-xl border bg-card shadow-sm">
				<GeneralTable
					headerGroups={table.getHeaderGroups()}
					rows={table.getRowModel().rows}
					emptyMessage={emptyMessage}
				/>
			</div>

			<ReportDetailDialog
				reportId={selectedReportId ?? ""}
				open={!!selectedReportId}
				onOpenChange={(open) => {
					if (!open) setSelectedReportId(null);
				}}
			/>
		</>
	);
}
