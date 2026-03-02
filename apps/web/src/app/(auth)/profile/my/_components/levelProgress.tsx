import { ChevronRight, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";

interface LevelProgressProps {
	level: number;
	levelName: string;
	xpProgress: number;
	xpForNextLevel: number;
	totalXp: number;
}

export default function LevelProgress({
	level,
	levelName,
	xpProgress,
	xpForNextLevel,
	totalXp,
}: LevelProgressProps) {
	const progressPercent = Math.round((xpProgress / xpForNextLevel) * 100);
	const xpNeeded = xpForNextLevel - xpProgress;

	return (
		<Card className="overflow-hidden border-0 shadow-md">
			<div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 dark:from-violet-700 dark:to-indigo-700">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
						<Trophy className="h-5 w-5 text-white" />
					</div>
					<div>
						<p className="font-medium text-sm text-white/80">
							До следующего уровня
						</p>
						<p className="font-bold text-lg text-white">{levelName}</p>
					</div>
				</div>
			</div>
			<div className="p-5">
				<div className="mb-3 flex items-center justify-between">
					<span className="font-medium text-muted-foreground text-sm">
						Уровень {level}
					</span>
					<span className="font-medium text-muted-foreground text-sm">
						Уровень {level + 1}
					</span>
				</div>
				<ProgressBar percent={progressPercent} className="h-3" />
				<div className="mt-4 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<span className="font-bold text-2xl text-violet-600 dark:text-violet-400">
							{xpProgress}
						</span>
						<span className="text-muted-foreground text-sm">
							/ {xpForNextLevel} XP
						</span>
					</div>
					<div className="flex items-center gap-1 font-medium text-muted-foreground text-sm">
						Осталось{" "}
						<span className="text-violet-600 dark:text-violet-400">
							{xpNeeded} XP
						</span>
						<ChevronRight className="h-4 w-4" />
					</div>
				</div>
				<p className="mt-3 text-muted-foreground text-xs">
					Всего накоплено: <span className="font-medium">{totalXp} XP</span>
				</p>
			</div>
		</Card>
	);
}
