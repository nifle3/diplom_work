"use client";

import { useMutation } from "@tanstack/react-query";
import {
	type ColumnDef,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Pencil, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { GeneralTable } from "@/components/generalTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/date";
import { trpc } from "@/lib/trpc";
import { AchievementForm } from "./achievementForm";

export interface AchievementRow {
	id: string;
	name: string;
	description: string;
	iconUrl: string | null;
	formula: string;
	createdAt: Date;
	updatedAt: Date;
	awardedCount: number;
}

interface AchievementsTableProps {
	data: AchievementRow[];
}

const columns = (
	onEdit: (achievement: AchievementRow) => void,
): ColumnDef<AchievementRow>[] => [
	{
		accessorKey: "name",
		header: "Название",
		cell: ({ row }) => (
			<div className="flex flex-col gap-1">
				<span className="font-medium">{row.original.name}</span>
				<span className="text-muted-foreground text-sm">
					{row.original.description}
				</span>
			</div>
		),
	},
	{
		accessorKey: "formula",
		header: "Формула",
		cell: ({ row }) => (
			<code className="max-w-[360px] truncate rounded-md bg-muted px-2 py-1 font-mono text-xs">
				{row.original.formula}
			</code>
		),
	},
	{
		accessorKey: "awardedCount",
		header: "Получили",
		cell: ({ row }) => (
			<Badge variant="secondary">{row.original.awardedCount}</Badge>
		),
	},
	{
		accessorKey: "updatedAt",
		header: "Обновлено",
		cell: ({ row }) => formatDate(row.original.updatedAt),
	},
	{
		id: "actions",
		header: "Действия",
		cell: ({ row }) => (
			<div className="flex gap-2">
				<Dialog>
					<DialogTrigger asChild>
						<Button variant="ghost" size="icon">
							<Pencil className="h-4 w-4" />
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle>Редактировать достижение</DialogTitle>
						</DialogHeader>
						<AchievementForm
							achievement={row.original}
							onSuccess={() => onEdit(row.original)}
						/>
					</DialogContent>
				</Dialog>
			</div>
		),
	},
];

export function AchievementsTable({ data }: AchievementsTableProps) {
	const router = useRouter();
	const recalculateMutation = useMutation(
		trpc.achievement.recalculateAll.mutationOptions({
			onSuccess: () => {
				router.refresh();
			},
		}),
	);

	const table = useReactTable({
		data,
		columns: columns(() => {
			router.refresh();
		}),
		getCoreRowModel: getCoreRowModel(),
	});

	const totalAwards = data.reduce((sum, item) => sum + item.awardedCount, 0);

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-muted">
							<Sparkles className="h-5 w-5 text-muted-foreground" />
						</div>
						<div>
							<h1 className="font-semibold text-2xl">Достижения</h1>
							<p className="text-muted-foreground">
								Создавайте формулы, чтобы награды выдавались автоматически по
								данным пользователя.
							</p>
						</div>
					</div>
					<p className="text-muted-foreground text-sm">
						Всего достижений: {data.length}. Всего выдач: {totalAwards}.
					</p>
				</div>

				<div className="flex flex-wrap gap-2">
					<Dialog>
						<DialogTrigger asChild>
							<Button>Создать достижение</Button>
						</DialogTrigger>
						<DialogContent className="max-w-2xl">
							<DialogHeader>
								<DialogTitle>Новое достижение</DialogTitle>
							</DialogHeader>
							<AchievementForm />
						</DialogContent>
					</Dialog>
					<Button
						variant="outline"
						onClick={() => recalculateMutation.mutate()}
						disabled={recalculateMutation.isPending}
					>
						Пересчитать награды
					</Button>
				</div>
			</div>

			<GeneralTable
				headerGroups={table.getHeaderGroups()}
				rows={table.getRowModel().rows}
				emptyMessage="Достижения ещё не созданы"
			/>
		</div>
	);
}
