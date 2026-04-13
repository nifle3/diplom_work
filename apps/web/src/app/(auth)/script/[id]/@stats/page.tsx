import { Award, MessageSquare } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { serverTrpc } from "@/lib/trpcServer";

type StatCard = {
	label: string;
	value: string;
	description: string;
	icon: typeof Award;
	accent: string;
};

function shouldHideStats(error: unknown) {
	if (typeof error !== "object" || error === null) {
		return false;
	}

	const code = (error as { code?: string }).code;
	return code === "NOT_FOUND" || code === "FORBIDDEN";
}

export default async function Page({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const trpcCaller = await serverTrpc();

	let stats;

	try {
		stats = await trpcCaller.script.getAuthorStatsByScript(id);
	} catch (error) {
		if (!shouldHideStats(error)) {
			throw error;
		}

		return null;
	}

	const cards: StatCard[] = [
		{
			label: "Завершённых интервью",
			value: stats.completedInterviews.toLocaleString("ru-RU"),
			description: "Все завершённые попытки по этому сценарию.",
			icon: MessageSquare,
			accent: "from-sky-500 to-cyan-500",
		},
		{
			label: "Средний балл",
			value:
				stats.averageScore === null
					? "—"
					: `${stats.averageScore.toFixed(1)}%`,
			description: "Среднее значение по завершённым интервью.",
			icon: Award,
			accent: "from-violet-500 to-fuchsia-500",
		},
	];

	return (
		<Card className="overflow-hidden border-border/60 bg-background/95 shadow-slate-950/5 shadow-xl">
			<div className="relative p-6 sm:p-8">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.10),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.10),transparent_30%)]" />

				<div className="relative space-y-6">
					<div className="space-y-3">
						<div className="flex flex-wrap gap-2">
							<Badge variant="secondary" className="bg-sky-100 text-sky-900">
								Только для автора
							</Badge>
							<Badge variant="outline" className="bg-background/80">
								По завершённым интервью
							</Badge>
						</div>

						<div className="space-y-2">
							<h3 className="font-semibold text-2xl tracking-tight">
								Сводка по сценарию
							</h3>
							<p className="max-w-2xl text-muted-foreground text-sm leading-6">
								Здесь собраны основные метрики по прохождениям интервью, чтобы
								быстро оценить активность и средний результат по этому
								сценарию.
							</p>
						</div>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						{cards.map((card) => {
							const Icon = card.icon;

							return (
								<div
									key={card.label}
									className="group relative overflow-hidden rounded-2xl border border-border/60 bg-background/80 p-5 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
								>
									<div
										className={`absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-10 ${card.accent}`}
									/>

									<div className="relative flex items-start gap-4">
										<div
											className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${card.accent} text-white shadow-md`}
										>
											<Icon className="h-6 w-6" />
										</div>

										<div className="min-w-0 flex-1">
											<p className="font-medium text-muted-foreground text-sm">
												{card.label}
											</p>
											<p className="mt-2 font-semibold text-3xl tracking-tight">
												{card.value}
											</p>
											<p className="mt-1 text-muted-foreground text-sm leading-6">
												{card.description}
											</p>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</Card>
	);
}
