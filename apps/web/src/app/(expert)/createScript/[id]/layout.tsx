import { ArrowLeft, BadgeCheck, Layers3, Sparkles } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const steps = [
	{
		id: 1,
		title: "База курса",
		description: "Название, описание, категория и обложка.",
	},
	{
		id: 2,
		title: "Критерии оценки",
		description: "Контекст и критерии, по которым будет идти интервью.",
	},
	{
		id: 3,
		title: "Вопросы",
		description: "Шаблоны вопросов и критерии внутри каждого вопроса.",
	},
];

export default function Layout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	return (
		<div className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-background via-background to-muted/40">
			<div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.12),transparent_42%),radial-gradient(circle_at_top_right,hsl(var(--foreground)/0.06),transparent_36%)]" />
			<div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(to_top,hsl(var(--background))_10%,transparent_100%)]" />

			<div className="relative mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 pb-12 sm:px-6 sm:pb-16 lg:px-8 lg:py-6 lg:pb-20">
				<div className="flex items-center justify-between gap-4">
					<Button
						asChild
						variant="ghost"
						size="sm"
						className="px-0 text-muted-foreground"
					>
						<Link href="/expert">
							<ArrowLeft data-icon="inline-start" />
							Вернуться к черновикам
						</Link>
					</Button>

					<Badge
						variant="secondary"
						className="gap-1.5 border border-border/60 bg-background/80 px-3 py-1 text-[11px] uppercase tracking-[0.22em] backdrop-blur"
					>
						<Layers3 />
						Черновик
					</Badge>
				</div>

				<div className="grid gap-4 pb-2 lg:grid-cols-[280px_minmax(0,1fr)]">
					<Card className="border-border/60 bg-card/90 shadow-foreground/5 shadow-lg backdrop-blur">
						<CardHeader className="flex flex-col gap-3 px-5 pt-5">
							<div className="flex flex-wrap items-center gap-2">
								<Badge variant="outline" className="gap-1.5">
									<Sparkles />
									Создание курса
								</Badge>
								<Badge variant="secondary" className="gap-1.5">
									<BadgeCheck />3 шага
								</Badge>
							</div>

							<div className="flex flex-col gap-1.5">
								<CardTitle className="text-2xl tracking-tight">
									Собираем сценарий без лишнего шума
								</CardTitle>
								<CardDescription className="text-sm leading-6">
									Заполняйте форму по шагам. Ниже еще есть место для
									продолжения, поэтому экран не должен восприниматься как
									финальный.
								</CardDescription>
							</div>
						</CardHeader>

						<CardContent className="flex flex-col gap-3 px-5 pb-5">
							<Separator />
							<div className="flex flex-col gap-3">
								{steps.map((step) => (
									<div key={step.id} className="flex items-start gap-3">
										<Badge variant="outline" className="mt-0.5 min-w-8">
											{step.id}
										</Badge>
										<div className="flex flex-col gap-1">
											<p className="font-medium text-sm leading-none">
												{step.title}
											</p>
											<p className="text-muted-foreground text-sm leading-5">
												{step.description}
											</p>
										</div>
									</div>
								))}
							</div>
							<Separator />
							<p className="text-balance text-muted-foreground text-sm leading-6">
								На финальном шаге сценарий можно сразу перевести из черновика в
								обычный опубликованный формат.
							</p>
						</CardContent>
					</Card>

					<div className="min-w-0">{children}</div>
				</div>
			</div>
		</div>
	);
}
