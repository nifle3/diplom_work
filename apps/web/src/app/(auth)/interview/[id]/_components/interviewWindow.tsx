"use client";

import { Bot, Send, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

export type Message = {
	id: string;
	isAi: boolean;
	messageText: string;
	createdAt: Date;
};

type InterviewWindowProps = {
	interviewId: string;
	initialQuestion: Message[];
	scriptTitle: string;
};

export default function InterviewWindow({
	interviewId,
	initialQuestion,
	scriptTitle
}: InterviewWindowProps) {
	const [messages, setMessages] = useState<Message[]>([]);
	const [inputValue, setInputValue] = useState("");
	const [isEndDialogOpen, setIsEndDialogOpen] = useState(false);
	const [isSending, setIsSending] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	useEffect(() => {
		if (initialQuestion) {
			setMessages([
				{
					id: "1",
					role: "assistant",
					content: initialQuestion,
					timestamp: new Date(),
				},
			]);
		}
	}, [initialQuestion]);

	const handleSend = async () => {
		if (!inputValue.trim() || isSending || isLoading) return;

		const userMessage: Message = {
			id: Date.now().toString(),
			role: "user",
			content: inputValue.trim(),
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, userMessage]);
		setInputValue("");
		setIsSending(true);

		try {
			await onSendMessage(userMessage.content);
		} finally {
			setIsSending(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const handleEndConfirm = () => {
		setIsEndDialogOpen(false);
		onEnd();
	};

	return (
		<div className="flex h-screen flex-col bg-background text-foreground">
			<header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4">
				<h1 className="font-semibold text-base">{scriptTitle}</h1>
				<Dialog open={isEndDialogOpen} onOpenChange={setIsEndDialogOpen}>
					<DialogTrigger>
						<Button variant="outline" size="sm">
							<X className="mr-1.5 size-4" />
							Завершить интервью
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Завершить интервью?</DialogTitle>
							<DialogDescription>
								Вы уверены, что хотите завершить интервью? Прогресс будет
								сохранён.
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setIsEndDialogOpen(false)}
							>
								Отмена
							</Button>
							<Button variant="destructive" onClick={handleEndConfirm}>
								Завершить
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</header>

			<main className="flex-1 overflow-y-auto px-4 pb-4">
				<div className="mx-auto max-w-3xl space-y-6 py-4">
					{messages.map((message) => (
						<div
							key={message.id}
							className={`flex gap-3 ${
								message.role === "user" ? "flex-row-reverse" : ""
							}`}
						>
							<Avatar size="default" className="shrink-0">
								<AvatarImage
									src={message.role === "assistant" ? aiAvatar : userAvatar}
								/>
								<AvatarFallback>
									{message.role === "assistant" ? (
										<Bot className="size-5" />
									) : (
										<User className="size-5" />
									)}
								</AvatarFallback>
							</Avatar>
							<div
								className={`flex max-w-[80%] flex-col ${
									message.role === "user" ? "items-end" : "items-start"
								}`}
							>
								<div
									className={`rounded-2xl px-4 py-2.5 text-sm ${
										message.role === "user"
											? "bg-primary text-primary-foreground"
											: "bg-muted"
									}`}
								>
									{message.content}
								</div>
								<span className="mt-1 text-muted-foreground text-xs">
									{message.timestamp.toLocaleTimeString([], {
										hour: "2-digit",
										minute: "2-digit",
									})}
								</span>
							</div>
						</div>
					))}
					{isLoading && (
						<div className="flex gap-3">
							<Avatar size="default" className="shrink-0">
								<AvatarFallback>
									<Bot className="size-5" />
								</AvatarFallback>
							</Avatar>
							<div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-2.5 text-muted-foreground text-sm">
								<Spinner className="size-4" />
								Печатает...
							</div>
						</div>
					)}
					<div ref={messagesEndRef} />
				</div>
			</main>

			<footer className="shrink-0 border-t bg-background p-4">
				<div className="mx-auto max-w-3xl">
					<div className="flex gap-2">
						<Textarea
							ref={textareaRef}
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder="Напишите ваш ответ..."
							className="max-h-[200px] min-h-[44px] resize-none rounded-2xl py-3"
							disabled={isLoading || isSending}
						/>
						<Button
							size="icon"
							onClick={handleSend}
							disabled={!inputValue.trim() || isLoading || isSending}
							className="shrink-0 rounded-2xl"
						>
							<Send className="size-4" />
						</Button>
					</div>
				</div>
			</footer>
		</div>
	);
}
