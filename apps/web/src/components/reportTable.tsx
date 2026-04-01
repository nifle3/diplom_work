"use client";

import { useMutation } from "@tanstack/react-query";
import {
	type ColumnDef,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, CheckCircle2, Clock3, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GeneralTable } from "@/components/generalTable";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { reportStatuses, type ReportStatus } from "@/lib/reportStatus";

export type ReportRow = {
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

const statusMeta: Record<
	ReportStatus,
	{
		label: string;
		icon: typeof Clock3;
		className: string;
	}
> = {
	new: {
		label: "Новая",
		icon: ShieldAlert,
		className: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
	},
	in_review: {
		label: "На проверке",
		icon: Clock3,
		className: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",
	},
	resolved: {
		label: "Решено",
		icon: CheckCircle2,
		className: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
	},
	rejected: {
		label: "Отклонено",
		icon: ShieldAlert,
		className: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300",
	},
};

function formatDate(value: Date | string) {
	return new Intl.DateTimeFormat("ru-RU", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(new Date(value));
}

export function ReportTable({
	data,
	canManage = false,
	showReporter = true,
	emptyMessage = "Жалоб пока нет",
}: ReportTableProps) {
	const router = useRouter();
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
			cell: ({ row }) => {
				const meta = statusMeta[row.original.status];
				const Icon = meta.icon;
				return (
					<Badge variant="outline" className={`gap-1.5 ${meta.className}`}>
						<Icon className="size-3.5" />
						{meta.label}
					</Badge>
				);
			},
		},
		{
			accessorKey: "reason",
			header: "Причина",
			cell: ({ row }) => (
				<p className="max-w-xl whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
					{row.original.reason}
				</p>
			),
		},
		{
			accessorKey: "createdAt",
			header: "Создано",
			cell: ({ row }) => (
				<div className="text-sm text-muted-foreground">
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
				const options = reportStatuses.filter((status) => status !== currentStatus);

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
		<div className="overflow-hidden rounded-xl border bg-card shadow-sm">
			<GeneralTable
				headerGroups={table.getHeaderGroups()}
				rows={table.getRowModel().rows}
				emptyMessage={emptyMessage}
			/>
		</div>
	);
}
