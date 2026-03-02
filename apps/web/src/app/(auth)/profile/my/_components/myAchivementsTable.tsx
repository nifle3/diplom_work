"use client";

import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Award, Calendar, Star, Target, Trophy, Zap } from "lucide-react";

interface AchievementRow {
	id: string;
	name: string;
	description: string;
	iconUrl: string | null;
	awardedAt: Date | string | null;
}

interface MyAchievementsTableProps {
	data?: AchievementRow[];
	isLoading?: boolean;
}

const mockAchievements: AchievementRow[] = [
	{
		id: "1",
		name: "Первое интервью",
		description: "Пройдите ваше первое интервью",
		iconUrl: null,
		awardedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
	},
	{
		id: "2",
		name: "Набираем обороты",
		description: "Пройдите 5 интервью",
		iconUrl: null,
		awardedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
	},
	{
		id: "3",
		name: "Мастер общения",
		description: "Получите оценку 90% или выше",
		iconUrl: null,
		awardedAt: null,
	},
	{
		id: "4",
		name: "Неделя практики",
		description: "Maintain a 7-day streak",
		iconUrl: null,
		awardedAt: null,
	},
];

const iconMap: Record<string, typeof Trophy> = {
	Trophy: Trophy,
	Star: Star,
	Zap: Zap,
	Target: Target,
	Award: Award,
};

const getRandomIcon = () => {
	const icons = Object.keys(iconMap);
	const randomIcon = icons[Math.floor(Math.random() * icons.length)];
	return iconMap[randomIcon] || Trophy;
};

const columns: ColumnDef<AchievementRow>[] = [
	{
		accessorKey: "name",
		header: "Название",
		cell: ({ row }) => {
			const isEarned = row.original.awardedAt !== null;
			const Icon = getRandomIcon();
			return (
				<div className="flex items-center gap-3">
					<div
						className={`flex h-10 w-10 items-center justify-center rounded-full ${
							isEarned
								? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
								: "bg-muted text-muted-foreground"
						}`}
					>
						<Icon className="h-5 w-5" />
					</div>
					<span
						className={`font-medium ${!isEarned && "text-muted-foreground"}`}
					>
						{row.original.name}
					</span>
				</div>
			);
		},
	},
	{
		accessorKey: "description",
		header: "Описание",
		cell: ({ row }) => (
			<span className="text-muted-foreground">{row.original.description}</span>
		),
	},
	{
		accessorKey: "awardedAt",
		header: "Получено",
		cell: ({ row }) => {
			const date = row.original.awardedAt;
			if (!date) {
				return (
					<span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 font-medium text-muted-foreground text-xs">
						Не получено
					</span>
				);
			}
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
];

export default function MyAchievementsTable({
	data = mockAchievements,
	isLoading,
}: MyAchievementsTableProps) {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	if (isLoading) {
		return (
			<div className="rounded-xl border bg-card shadow-sm">
				<div className="border-b">
					<div className="grid grid-cols-3 gap-4 p-4">
						{Array.from({ length: 3 }).map((_, i) => (
							<div
								key={`header-${i}`}
								className="h-5 animate-pulse rounded bg-muted"
							/>
						))}
					</div>
				</div>
				<div className="divide-y">
					{Array.from({ length: 4 }).map((_, i) => (
						<div key={`row-${i}`} className="grid grid-cols-3 gap-4 p-4">
							{Array.from({ length: 3 }).map((_, j) => (
								<div
									key={`cell-${i}-${j}`}
									className="h-10 animate-pulse rounded bg-muted"
								/>
							))}
						</div>
					))}
				</div>
			</div>
		);
	}

	const earnedCount = data.filter((a) => a.awardedAt !== null).length;
	const totalCount = data.length;

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm">
				<div className="flex items-center gap-3">
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
						<Trophy className="h-6 w-6 text-amber-600 dark:text-amber-400" />
					</div>
					<div>
						<p className="text-muted-foreground text-sm">Всего достижений</p>
						<p className="font-bold text-2xl">
							{earnedCount} / {totalCount}
						</p>
					</div>
				</div>
				<div className="h-3 w-32 overflow-hidden rounded-full bg-muted">
					<div
						className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 transition-all"
						style={{ width: `${(earnedCount / totalCount) * 100}%` }}
					/>
				</div>
			</div>

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
						{table.getRowModel().rows.map((row) => {
							const isEarned = row.original.awardedAt !== null;
							return (
								<tr
									key={row.id}
									className={`transition-colors ${isEarned ? "hover:bg-muted/50" : "opacity-60"}`}
								>
									{row.getVisibleCells().map((cell) => (
										<td key={cell.id} className="px-4 py-4">
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</td>
									))}
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
}
