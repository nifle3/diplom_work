import { ArrowRight, CalendarDays, Sparkles } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { serverTrpc } from "@/lib/trpcServer";

function formatActivityDate(date: Date | string | null) {
	if (!date) {
		return "Дата недоступна";
	}

	return new Intl.DateTimeFormat("ru-RU", {
		day: "numeric",
		month: "long",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date(date));
}

export default async function Page() {
	const trpcCaller = await serverTrpc();
	const recentActivity = await trpcCaller.activity.getLatestUserActivity();

	return (
		<>
			{recentActivity?.length ? (
				<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
					{recentActivity.map((activity) => (
						<Card
							key={activity.id}
							className="group relative flex h-full flex-col gap-0 overflow-hidden py-0 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
						>
							<Link
								href={{ pathname: `/interview/${activity.id}/results` }}
								aria-label={`Открыть результаты интервью ${activity.title}`}
								className="absolute inset-0 z-20 rounded-xl"
							/>

							<div className="relative flex h-20 items-center justify-between overflow-hidden bg-gradient-to-r from-blue-500 via-sky-500 to-indigo-500 px-4">
								<div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
								<div className="absolute -bottom-12 left-6 h-20 w-20 rounded-full bg-white/10 blur-2xl" />

								<div className="relative z-0 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-white shadow-sm backdrop-blur-sm">
									<Sparkles className="h-4 w-4" />
								</div>

								<div className="relative z-0 rounded-full border border-white/20 bg-white/15 px-2.5 py-1 text-[11px] text-white/90 backdrop-blur-sm">
									Последняя активность
								</div>
							</div>

							<div className="relative z-10 flex h-full flex-col justify-between px-4 py-4">
								<div>
									<h3 className="line-clamp-2 font-semibold text-sm leading-snug">
										{activity.title}
									</h3>

									<p className="mt-1.5 line-clamp-1 text-muted-foreground text-xs">
										Завершённый разговор доступен в результатах интервью.
									</p>
								</div>

								<div className="mt-4 flex items-end justify-between gap-3 border-t pt-3 text-[11px] text-muted-foreground">
									<div className="flex flex-col gap-1">
										<span className="flex items-center gap-1.5">
											<CalendarDays className="h-3 w-3" />
											{formatActivityDate(activity.date)}
										</span>
										<span className="font-medium text-sky-700 dark:text-sky-300">
											Открыть результаты
										</span>
									</div>

									<div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-50 text-sky-700 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:bg-sky-950/60 dark:text-sky-300">
										<ArrowRight className="h-3.5 w-3.5" />
									</div>
								</div>
							</div>
						</Card>
					))}
				</div>
			) : (
				<div className="text-gray-500">Нет недавней активности</div>
			)}
		</>
	);
}
