import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { formatDate } from "../_lib/formatDate";

type SummaryCardProps = {
	expertFeedback?: string | null;
	startedAt: Date | null;
};

export function SummaryCard({ expertFeedback, startedAt }: SummaryCardProps) {
	return (
		<Card className="border-0 shadow-black/5 shadow-lg">
			<CardHeader>
				<CardTitle>Краткая сводка</CardTitle>
				<CardDescription>Ключевые метрики по этой попытке.</CardDescription>
			</CardHeader>

			<CardContent className="space-y-5">
				<div className="space-y-2 rounded-2xl border bg-muted/30 p-4">
					<div className="text-muted-foreground text-xs uppercase tracking-[0.18em]">
						Старт интервью
					</div>
					<div className="font-medium leading-6">{formatDate(startedAt)}</div>
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
						{expertFeedback?.trim() || "Комментарий не сформирован."}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
