import {
	Award,
	CalendarDays,
	ChevronLeft,
	Clock3,
	FileText,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { serverTrpc } from "@/lib/trpcServer";
import { formatDate } from "./_lib/formatDate";
import { formatDuration } from "./_lib/formatDuration";
import { getBackHref } from "./_lib/getBackHref";
import { getScoreTone } from "./_lib/getScoreTone";

export const metadata = {
	title: "Результаты интервью",
};

export default async function ResultsPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const trpcCaller = await serverTrpc();
	const result = await trpcCaller.session.getResultBySessionId(id);
	const backHref = getBackHref(result.script?.id);

	if (result.status !== "complete") {
		redirect(`/interview/${id}`);
	}

	const scoreTone = getScoreTone(result.finalScore);
	const answeredQuestions = result.questions.filter((item) =>
		item.answer?.trim(),
	);
	const answeredCount = answeredQuestions.length;

	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_28%),linear-gradient(180deg,_rgba(15,23,42,0.02),_transparent_35%)] px-4 py-8">
			<div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="space-y-2">
						<Link href={backHref}>
							<Button variant="ghost" size="sm" className="-ml-3 w-fit">
								<ChevronLeft className="size-4" />К сценарию
							</Button>
						</Link>
						<div className="space-y-1">
							<p className="text-muted-foreground text-sm">
								Итог прохождения интервью
							</p>
							<h1 className="font-semibold text-3xl tracking-tight">
								{result.script?.title ?? "Результат интервью"}
							</h1>
							{result.script?.description ? (
								<p className="max-w-3xl text-muted-foreground text-sm leading-6">
									{result.script.description}
								</p>
							) : null}
						</div>
					</div>

					<Badge className={scoreTone.badgeClassName}>{scoreTone.label}</Badge>
				</div>

				<div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
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
											{result.finalScore ?? "—"}
											<span className="ml-2 text-2xl text-muted-foreground">
												/ 100
											</span>
										</div>
										<p className="max-w-xl text-muted-foreground text-sm leading-6">
											{result.expertFeedback?.trim() ||
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
												{formatDuration(result.startedAt, result.finishedAt)}
											</div>
										</div>
										<div className="rounded-2xl border bg-background/80 p-4 backdrop-blur">
											<div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-[0.18em]">
												<CalendarDays className="size-3.5" />
												Завершено
											</div>
											<div className="mt-2 font-medium text-sm leading-6">
												{formatDate(result.finishedAt)}
											</div>
										</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="border-0 shadow-black/5 shadow-lg">
						<CardHeader>
							<CardTitle>Краткая сводка</CardTitle>
							<CardDescription>
								Ключевые метрики по этой попытке.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-5">
							<div className="space-y-2 rounded-2xl border bg-muted/30 p-4">
								<div className="text-muted-foreground text-xs uppercase tracking-[0.18em]">
									Старт интервью
								</div>
								<div className="font-medium leading-6">
									{formatDate(result.startedAt)}
								</div>
							</div>
							<div className="space-y-2 rounded-2xl border bg-muted/30 p-4">
								<div className="text-muted-foreground text-xs uppercase tracking-[0.18em]">
									Статус
								</div>
								<div className="font-medium">Завершено</div>
							</div>
							<div className="space-y-2 rounded-2xl border bg-muted/30 p-4">
								<div className="text-muted-foreground text-xs uppercase tracking-[0.18em]">
									Комментарий
								</div>
								<div className="text-sm leading-6">
									{result.expertFeedback?.trim() ||
										"Комментарий не сформирован."}
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				<section className="space-y-4">
					<div className="space-y-1">
						<h2 className="font-semibold text-2xl tracking-tight">
							Разбор по вопросам
						</h2>
						<p className="text-muted-foreground text-sm">
							Показываем вопрос, ваш ответ и заметку с оценкой качества ответа.
						</p>
					</div>

					<div className="space-y-4">
						{answeredQuestions.length === 0 ? (
							<Card className="border-dashed">
								<CardContent className="py-10 text-center text-muted-foreground text-sm">
									Подробный разбор еще не сформирован. Попробуйте открыть
									страницу чуть позже.
								</CardContent>
							</Card>
						) : (
							answeredQuestions.map((item, index) => (
								<Card
									key={item.id}
									className="border-0 bg-card/95 shadow-black/5 shadow-lg backdrop-blur"
								>
									<CardHeader className="gap-3">
										<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
											<div className="space-y-1">
												<CardDescription>Вопрос {index + 1}</CardDescription>
												<CardTitle className="text-lg leading-7">
													{item.question}
												</CardTitle>
											</div>
											{item.answeredAt ? (
												<Badge variant="outline" className="shrink-0">
													{new Intl.DateTimeFormat("ru-RU", {
														hour: "2-digit",
														minute: "2-digit",
													}).format(item.answeredAt)}
												</Badge>
											) : null}
										</div>
									</CardHeader>
									<CardContent className="space-y-5">
										<div className="space-y-2 rounded-2xl border bg-muted/20 p-4">
											<div className="text-muted-foreground text-xs uppercase tracking-[0.18em]">
												Ваш ответ
											</div>
											<p className="text-sm leading-7">{item.answer}</p>
										</div>
										<div className="space-y-2 rounded-2xl border bg-background p-4">
											<div className="text-muted-foreground text-xs uppercase tracking-[0.18em]">
												Заметка по ответу
											</div>
											<p className="text-muted-foreground text-sm leading-7">
												{item.analysisNote?.trim() ||
													"Для этого ответа не удалось получить отдельный комментарий."}
											</p>
										</div>
									</CardContent>
								</Card>
							))
						)}
					</div>
				</section>
			</div>
		</div>
	);
}
