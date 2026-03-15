"use client";

import { X } from "lucide-react";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";

export function FinishInterviewButton() {
	return (
		<Modal
			header="Завершить интервью?"
			description="Вы уверены, что хотите завершить интервью? Прогресс будет сохранен."
			actionName="Завершить"
			action={() => console.log("Exit")}
			asChild={true}
		>
			<Button variant="outline" size="sm">
				<X className="mr-1.5 size-4" />
				Завершить интервью
			</Button>
		</Modal>
	);
}
