import type { Route } from "next";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

interface StepNavigationProps {
	basePath: string;
	currentStep: number;
}

export function StepNavigation({ basePath, currentStep }: StepNavigationProps) {
	const router = useRouter();
	const steps = [
		{ id: 1, path: "firstStep" },
		{ id: 2, path: "secondStep" },
		{ id: 3, path: "thirdStep" },
	];

	return (
		<div className="mb-6 flex items-center gap-4">
			<div className="font-medium text-lg">
				Шаг {currentStep} из 3: Основная информация
			</div>
			<div className="ml-auto flex gap-2">
				{steps.map((step) => (
					<Button
						key={step.id}
						type="button"
						variant={currentStep === step.id ? "default" : "ghost"}
						size="sm"
						onClick={() => router.push(`${basePath}/${step.path}` as Route)}
					>
						{step.id}
					</Button>
				))}
			</div>
		</div>
	);
}
