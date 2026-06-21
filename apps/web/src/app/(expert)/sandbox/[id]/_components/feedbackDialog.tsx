"use client";

import { MessageSquare, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

interface FeedbackDialogProps {
	analysisNote: string | null;
	messageText: string;
}

export function FeedbackDialog({
	analysisNote,
	messageText,
}: FeedbackDialogProps) {
	if (!analysisNote) {
		return null;
	}

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="h-7 w-7 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
					title="Посмотреть фидбек"
				>
					<MessageSquare className="size-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Star className="size-5 text-warning" />
						Фидбек к вашему ответу
					</DialogTitle>
				</DialogHeader>
				<div className="space-y-4">
					<div className="rounded-lg bg-muted p-4">
						<p className="mb-2 font-medium text-muted-foreground text-sm">
							Ваш ответ:
						</p>
						<p className="whitespace-pre-wrap text-sm">{messageText}</p>
					</div>
					<div className="rounded-lg border border-border bg-accent p-4">
						<p className="mb-2 font-medium text-muted-foreground text-sm">
							Анализ ответа:
						</p>
						<p className="whitespace-pre-wrap text-sm">{analysisNote}</p>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
