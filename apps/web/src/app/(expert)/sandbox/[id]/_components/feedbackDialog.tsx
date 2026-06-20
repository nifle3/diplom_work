"use client";

import { MessageSquare, Star } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FeedbackDialogProps {
	analysisNote: string | null;
	messageText: string;
}

export function FeedbackDialog({ analysisNote, messageText }: FeedbackDialogProps) {
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
						<p className="font-medium text-sm text-muted-foreground mb-2">
							Ваш ответ:
						</p>
						<p className="text-sm whitespace-pre-wrap">{messageText}</p>
					</div>
					<div className="rounded-lg bg-accent p-4 border border-border">
						<p className="font-medium text-sm text-muted-foreground mb-2">
							Анализ ответа:
						</p>
						<p className="text-sm whitespace-pre-wrap">{analysisNote}</p>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}