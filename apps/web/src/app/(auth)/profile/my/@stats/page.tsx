import { Award, Flame, MessageSquare, Zap } from "lucide-react";

import { Card } from "@/components/ui/card";
import { serverTrpc } from "@/lib/trpcServer";

export default async function Page() {
	const trpcCaller = await serverTrpc();
	const { 0: profileStats, 1: streak } = await Promise.all([
		trpcCaller.profile.getMyProfileStats(),
		trpcCaller.user.getStreak(),
	]);

	const stats = [
		{
			label: "Стрик",
			value: streak,
			unit: "дней",
			icon: Flame,
			color: "text-orange-500",
			bgColor: "bg-orange-50 dark:bg-orange-950",
			gradient: "from-orange-400 to-amber-500",
		},
		{
			label: "Опыт",
			value: profileStats.xp,
			unit: "XP",
			icon: Zap,
			color: "text-violet-500",
			bgColor: "bg-violet-50 dark:bg-violet-950",
			gradient: "from-violet-400 to-purple-500",
		},
		{
			label: "Интервью",
			value: profileStats.interviewCount,
			unit: "",
			icon: MessageSquare,
			color: "text-blue-500",
			bgColor: "bg-blue-50 dark:bg-blue-950",
			gradient: "from-blue-400 to-cyan-500",
		},
		{
			label: "Достижений",
			value: profileStats.achievementCount,
			unit: "",
			icon: Award,
			color: "text-amber-500",
			bgColor: "bg-amber-50 dark:bg-amber-950",
			gradient: "from-amber-400 to-yellow-500",
		},
	];

	return (
		<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
			{stats.map((stat) => (
				<Card
					key={stat.label}
					className="group relative overflow-hidden border-0 p-5 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg"
				>
					<div
						className={`absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-10 ${stat.gradient}`}
					/>
					<div className="relative z-10">
						<div
							className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${stat.bgColor}`}
						>
							<stat.icon className={`h-6 w-6 ${stat.color}`} />
						</div>
						<p className="font-medium text-muted-foreground text-sm">
							{stat.label}
						</p>
						<p className="mt-1 font-bold text-2xl tracking-tight">
							{stat.value}
							{stat.unit && (
								<span className="ml-1 font-normal text-muted-foreground text-sm">
									{stat.unit}
								</span>
							)}
						</p>
					</div>
				</Card>
			))}
		</div>
	);
}
