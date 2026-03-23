import { Award, CalendarDays, Clock3, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "../_lib/formatDate";
import { formatDuration } from "../_lib/formatDuration";
import type { getScoreTone } from "../_lib/getScoreTone";

type ScoreOverviewCardProps = {
	answeredCount: number;
	expertFeedback?: string | null;
	finalScore?: number | null;
	finishedAt: Date | null;
	scoreTone: ReturnType<typeof getScoreTone>;
	startedAt: Date | null;
};

export function ScoreOverviewCard({
	answeredCount,
	expertFeedback,
	finalScore,
	finishedAt,
	scoreTone,
	startedAt,
}: ScoreOverviewCardProps) {
	return (
		<Card className="overflow-hidden border-0 shadow-black/5 shadow-xl">
			<CardContent className="p-0">
				<div className="relative overflow-hidden rounded-xl bg-card p-8">
					<div
						className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${scoreTone.ringClassName}`}
					/>

					<div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
						<div className="space-y-3">
							<div className="inline-flex items-center gap-2 text-muted-foreground text-sm">
								<Award className="size-4" />
								Финальная оценка
							</div>

							<div
								className={`font-semibold text-6xl ${scoreTone.textClassName}`}
							>
								{finalScore ?? "—"}
								<span className="ml-2 text-2xl text-muted-foreground">
									/ 100
								</span>
							</div>

							<p className="max-w-xl text-muted-foreground text-sm leading-6">
								{expertFeedback?.trim() ||
									"Финальный комментарий пока отсутствует, но ответы по каждому вопросу уже доступны ниже."}
							</p>
						</div>

						<div className="grid gap-3 sm:grid-cols-3 lg:w-[340px] lg:grid-cols-1">
							<div className="rounded-2xl border bg-background/80 p-4 backdrop-blur">
								<div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-[0.18em]">
									<FileText className="size-3.5" />
									Вопросов
								</div>
								<div className="mt-2 font-semibold text-2xl">
									{answeredCount}
								</div>
							</div>

							<div className="rounded-2xl border bg-background/80 p-4 backdrop-blur">
								<div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-[0.18em]">
									<Clock3 className="size-3.5" />
									Длительность
								</div>
								<div className="mt-2 font-semibold text-2xl">
									{formatDuration(startedAt, finishedAt)}
								</div>
							</div>

							<div className="rounded-2xl border bg-background/80 p-4 backdrop-blur">
								<div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-[0.18em]">
									<CalendarDays className="size-3.5" />
									Завершено
								</div>
								<div className="mt-2 font-medium text-sm leading-6">
									{formatDate(finishedAt)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
