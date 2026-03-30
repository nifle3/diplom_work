"use client";

import { Ban } from "lucide-react";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { useInterviewContext } from "./interviewProvider";

export function CancelInterviewButton() {
	const { handleCancel, isCanceling, isSending, isFinishing } =
		useInterviewContext();

	return (
		<Modal
			header="Отменить интервью?"
			description="Опыт за это интервью не зачтётся, стрик не продлится, но результаты останутся доступны."
			actionName="Отменить"
			action={handleCancel}
			actionVariant="destructive"
			asChild={true}
		>
			<Button
				variant="outline"
				size="sm"
				disabled={isCanceling || isSending || isFinishing}
			>
				<Ban className="size-4" />
				Отменить
			</Button>
		</Modal>
	);
}
