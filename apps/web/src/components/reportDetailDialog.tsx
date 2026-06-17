"use client";

import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/statusBadge";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/date";
import { type ReportStatus, statusMeta } from "@/lib/reportStatus";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "./ui/skeleton";

type ReportDetailDialogProps = {
	reportId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function ReportDetailDialog({
	reportId,
	open,
	onOpenChange,
}: ReportDetailDialogProps) {
	const { data, isPending } = useQuery(
		trpc.report.getById.queryOptions(reportId, {
			enabled: open,
		}),
	);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Детали жалобы</DialogTitle>
					<DialogDescription>
						Полная информация о жалобе и история её обработки
					</DialogDescription>
				</DialogHeader>

				{isPending ? (
					<div className="space-y-4">
						<Skeleton className="h-6 w-3/4" />
						<Skeleton className="h-4 w-1/2" />
						<Skeleton className="h-24 w-full" />
						<Skeleton className="h-12 w-full" />
					</div>
				) : data ? (
					<div className="space-y-6">
						<section className="space-y-3">
							<h4 className="font-medium text-muted-foreground text-sm">
								Курс
							</h4>
							{data.scenario ? (
								<div className="space-y-1">
									<Link
										href={{ pathname: `/script/${data.scenario.id}` }}
										className="flex items-center gap-1.5 font-medium hover:underline"
									>
										{data.scenario.title}
										<ExternalLink className="size-3.5" />
									</Link>
									<div className="text-muted-foreground text-xs">
										Категория: {data.scenario.category?.name ?? "Без категории"}
									</div>
									<div className="text-muted-foreground text-xs">
										Автор: {data.scenario.expert.name}
									</div>
								</div>
							) : (
								<span className="text-muted-foreground">—</span>
							)}
						</section>

						<section className="space-y-3">
							<h4 className="font-medium text-muted-foreground text-sm">
								Заявитель
							</h4>
							<div className="space-y-1">
								<div className="font-medium">{data.reporter.name}</div>
								<div className="text-muted-foreground text-xs">
									{data.reporter.email}
								</div>
							</div>
						</section>

						<section className="space-y-3">
							<h4 className="font-medium text-muted-foreground text-sm">
								Текущий статус
							</h4>
							<StatusBadge status={data.status} />
						</section>

						<section className="space-y-3">
							<h4 className="font-medium text-muted-foreground text-sm">
								Причина
							</h4>
							<p className="whitespace-pre-wrap break-words rounded-lg bg-muted p-4 text-sm leading-6">
								{data.reason}
							</p>
						</section>

						<section className="space-y-3">
							<h4 className="font-medium text-muted-foreground text-sm">
								Дата создания
							</h4>
							<p className="text-sm">
								{formatDate(data.createdAt, {
									day: "2-digit",
									month: "long",
									year: "numeric",
									hour: "2-digit",
									minute: "2-digit",
								})}
							</p>
						</section>

						<section className="space-y-3">
							<h4 className="font-medium text-muted-foreground text-sm">
								История статусов
							</h4>
							{data.statusLogs.length > 0 ? (
								<div className="relative space-y-0">
									{data.statusLogs.map(
										(
											log: { status: ReportStatus; createdAt: Date | string },
											index: number,
										) => {
											const isFirst = index === 0;

											return (
												<div key={index} className="flex gap-3 pb-4 last:pb-0">
													<div className="flex flex-col items-center">
														<StatusBadge
															status={log.status}
															className="size-7 rounded-full"
															iconOnly
														/>
														{index < data.statusLogs.length - 1 && (
															<div className="mt-1 h-full w-px bg-border" />
														)}
													</div>
													<div className="pt-1">
														<div className="flex items-baseline gap-2">
															<span className="font-medium text-sm">
																{statusMeta[log.status].label}
															</span>
															{isFirst && (
																<span className="text-muted-foreground text-xs">
																	(текущий)
																</span>
															)}
														</div>
														<div className="text-muted-foreground text-xs">
															{formatDate(log.createdAt, {
																day: "2-digit",
																month: "short",
																year: "numeric",
																hour: "2-digit",
																minute: "2-digit",
															})}
														</div>
													</div>
												</div>
											);
										},
									)}
								</div>
							) : (
								<p className="text-muted-foreground text-sm">
									История статусов отсутствует
								</p>
							)}
						</section>
					</div>
				) : (
					<p className="text-muted-foreground text-sm">
						Не удалось загрузить информацию о жалобе
					</p>
				)}
			</DialogContent>
		</Dialog>
	);
}
