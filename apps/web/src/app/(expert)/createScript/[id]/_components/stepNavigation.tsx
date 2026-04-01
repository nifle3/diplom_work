import type { Route } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface StepNavigationProps {
	basePath: string;
	currentStep: number;
}

export function StepNavigation({ basePath, currentStep }: StepNavigationProps) {
	const steps = [
		{
			id: 1,
			label: "База",
			description: "Обложка и описание",
			path: "firstStep",
		},
		{
			id: 2,
			label: "Критерии",
			description: "Контекст и оценки",
			path: "secondStep",
		},
		{
			id: 3,
			label: "Вопросы",
			description: "Шаблоны интервью",
			path: "thirdStep",
		},
	];

	return (
		<nav className="mb-4 flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/90 p-3 shadow-sm backdrop-blur sm:flex-row sm:items-center">
			<div className="flex items-center gap-3">
				<Badge variant="secondary" className="h-7 gap-1.5 px-2.5 text-xs">
					Шаг {currentStep} из 3
				</Badge>
				<div className="flex flex-col gap-0.5">
					<p className="font-medium text-sm leading-none">Создание курса</p>
					<p className="text-muted-foreground text-xs">
						Переходите между этапами, не теряя данные.
					</p>
				</div>
			</div>

			<div className="flex flex-wrap gap-2 sm:ml-auto">
				{steps.map((step) => (
					<Button
						key={step.id}
						asChild
						variant={currentStep === step.id ? "default" : "outline"}
						size="sm"
						className="justify-start"
					>
						<Link href={`${basePath}/${step.path}` as Route}>
							<span className="font-semibold">{step.id}</span>
							<span>{step.label}</span>
						</Link>
					</Button>
				))}
			</div>
		</nav>
	);
}
