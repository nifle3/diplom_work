import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/date";

type Question = {
	id: string;
	answer: string | null;
	analysisNote: string | null;
	answeredAt: Date | null;
	question: string;
};

type QuestionsSectionProps = {
	questions: Question[];
};

export function QuestionsSection({ questions }: QuestionsSectionProps) {
	return (
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
				{questions.length === 0 ? (
					<Card className="border-dashed">
						<CardContent className="py-10 text-center text-muted-foreground text-sm">
							Подробный разбор еще не сформирован. Попробуйте открыть страницу
							чуть позже.
						</CardContent>
					</Card>
				) : (
					questions.map((question, index) => {
						return (
							<Card
								key={question.id}
								className="border-0 bg-card/95 shadow-black/5 shadow-lg backdrop-blur"
							>
								<CardHeader className="gap-3">
									<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
										<div className="space-y-1">
											<CardDescription>Вопрос {index + 1}</CardDescription>
											<CardTitle className="text-lg leading-7">
												{question.question}
											</CardTitle>
										</div>

										{question.answeredAt ? (
											<Badge variant="outline" className="shrink-0">
												{formatDate(question.answeredAt, {
													hour: "2-digit",
													minute: "2-digit",
												})}
											</Badge>
										) : null}
									</div>
								</CardHeader>

								<CardContent className="space-y-5">
									<div className="space-y-2 rounded-2xl border bg-muted/20 p-4">
										<div className="text-muted-foreground text-xs uppercase tracking-[0.18em]">
											Ваш ответ
										</div>
										<p className="text-sm leading-7">{question.answer}</p>
									</div>

									<div className="space-y-2 rounded-2xl border bg-background p-4">
										<div className="text-muted-foreground text-xs uppercase tracking-[0.18em]">
											Заметка по ответу
										</div>
										<p className="text-muted-foreground text-sm leading-7">
											{question.analysisNote?.trim() ||
												"Для этого ответа не удалось получить отдельный комментарий."}
										</p>
									</div>
								</CardContent>
							</Card>
						);
					})
				)}
			</div>
		</section>
	);
}
