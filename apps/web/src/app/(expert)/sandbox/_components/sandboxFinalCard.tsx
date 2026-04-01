import { Award, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SandboxSession } from "../_types";

type SandboxFinalCardProps = {
	finalEvaluation: SandboxSession["finalEvaluation"];
};

export function SandboxFinalCard({ finalEvaluation }: SandboxFinalCardProps) {
	if (!finalEvaluation) {
		return null;
	}

	return (
		<Card className="border-0 bg-card/95 shadow-black/5 shadow-xl">
			<CardHeader className="space-y-3">
				<div className="flex items-center gap-2 text-muted-foreground text-sm">
					<Sparkles className="size-4" />
					Финальный разбор sandbox
				</div>
				<div className="flex flex-wrap items-center justify-between gap-3">
					<CardTitle className="text-2xl">
						Оценка {finalEvaluation.score}/100
					</CardTitle>
					<Badge
						className={cn(
							"rounded-full",
							finalEvaluation.score >= 80 &&
								"border-emerald-200 bg-emerald-50 text-emerald-700",
							finalEvaluation.score >= 60 &&
								finalEvaluation.score < 80 &&
								"border-amber-200 bg-amber-50 text-amber-700",
							finalEvaluation.score < 60 &&
								"border-rose-200 bg-rose-50 text-rose-700",
						)}
						variant="outline"
					>
						{finalEvaluation.score >= 80
							? "Сильный результат"
							: finalEvaluation.score >= 60
								? "Есть база"
								: "Есть зоны роста"}
					</Badge>
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				<p className="text-sm leading-7 text-muted-foreground">
					{finalEvaluation.feedback}
				</p>

				<div className="rounded-2xl border bg-muted/20 p-4">
					<div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
						<Award className="size-3.5" />
						Короткий вывод
					</div>
					<p className="text-sm leading-7">
						{finalEvaluation.analysisNote}
					</p>
				</div>

				<div className="grid gap-3 md:grid-cols-2">
					<div className="rounded-2xl border bg-background/80 p-4">
						<div className="mb-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
							Сильные стороны
						</div>
						<ul className="space-y-2 text-sm leading-6">
							{finalEvaluation.strengths.length > 0 ? (
								finalEvaluation.strengths.map((item) => <li key={item}>• {item}</li>)
							) : (
								<li className="text-muted-foreground">Пока не выделены.</li>
							)}
						</ul>
					</div>

					<div className="rounded-2xl border bg-background/80 p-4">
						<div className="mb-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
							Зоны роста
						</div>
						<ul className="space-y-2 text-sm leading-6">
							{finalEvaluation.improvements.length > 0 ? (
								finalEvaluation.improvements.map((item) => <li key={item}>• {item}</li>)
							) : (
								<li className="text-muted-foreground">Пока не выделены.</li>
							)}
						</ul>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
