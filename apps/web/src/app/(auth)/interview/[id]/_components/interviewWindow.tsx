"use client";

import { X } from "lucide-react";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { useInterview } from "../_hooks/useInterview";
import type { Message } from "../_utils/type";
import { ChatInput } from "./chatInput";
import { MessageItem } from "./messageItem";
import { TypingIndicator } from "./typingIndicator";

type InterviewWindowProps = {
	interviewId: string;
	initialQuestion: Message[];
	scriptTitle: string;
};

export default function InterviewWindow({
	initialQuestion,
	interviewId,
	scriptTitle,
}: InterviewWindowProps) {
	const {
		messages,
		inputValue,
		setInputValue,
		isSending,
		messagesEndRef,
		handleSend,
	} = useInterview(initialQuestion, interviewId);

	return (
		<div className="flex h-screen flex-col bg-background text-foreground">
			<header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
				<h1 className="font-semibold text-base">{scriptTitle}</h1>
				<Modal
					header="Завершить интервью?"
					description="Вы уверены, что хотите завершить интервью? Прогресс будет сохранён."
					actionName="Завершить"
					action={() => console.log("Exit")}
				>
					<Button variant="outline" size="sm">
						<X className="mr-1.5 size-4" />
						Завершить интервью
					</Button>
				</Modal>
			</header>

			<main className="flex-1 overflow-y-auto px-4">
				<div className="mx-auto max-w-3xl space-y-6 py-6">
					{messages.map((msg) => (
						<MessageItem key={msg.id} message={msg} />
					))}

					{isSending && <TypingIndicator />}

					<div ref={messagesEndRef} className="h-4" />
				</div>
			</main>

			<footer className="shrink-0 border-t p-4">
				<div className="mx-auto max-w-3xl">
					<ChatInput
						value={inputValue}
						onChange={setInputValue}
						onSend={handleSend}
						disabled={isSending}
					/>
				</div>
			</footer>
		</div>
	);
}
