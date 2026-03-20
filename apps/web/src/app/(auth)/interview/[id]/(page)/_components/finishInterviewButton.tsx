"use client";

import { X } from "lucide-react";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { useInterviewContext } from "./interviewProvider";

export function FinishInterviewButton() {
	const { handleFinish, isFinishing } = useInterviewContext();

	return (
		<Modal
			header="Завершить интервью?"
			description="Вы уверены, что хотите завершить интервью? Прогресс будет сохранен."
			actionName="Завершить"
			action={handleFinish}
			asChild={true}
		>
			<Button variant="outline" size="sm" disabled={isFinishing}>
				<X className="mr-1.5 size-4" />
				Завершить интервью
			</Button>
		</Modal>
	);
}
