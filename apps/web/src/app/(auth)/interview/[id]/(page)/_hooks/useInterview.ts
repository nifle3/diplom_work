import { useMutation } from "@tanstack/react-query";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import type { Message } from "../_utils/type";

export function useInterview(sessionId: string) {
	const router = useRouter();
	const [messages, setMessages] = useState<Message[]>([]);
	const [inputValue, setInputValue] = useState("");
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
		messagesEndRef.current?.scrollIntoView({ behavior });
	};

	const newMessage = useMutation(
		trpc.session.addNewMessage.mutationOptions({
			onSuccess: (result) => {
				setInputValue("");

				if (result.type === "finished") {
					if (result.result.streakUpdated) {
						toast.success("Интервью завершено");
					} else {
						toast.success("Интервью уже завершено");
					}

					router.push(`/interview/${sessionId}/results` as Route);
					router.refresh();
					return;
				}

				setMessages((currentMessages) => [...currentMessages, result.message]);
				scrollToBottom("auto");
			},
		}),
	);

	const finishInterview = useMutation(
		trpc.session.finishSession.mutationOptions({
			onSuccess: (result) => {
				if (result.complete) {
					toast.success("Интервью завершено");
				} else {
					toast.success("Интервью уже завершено");
				}

				router.push(`/interview/${sessionId}/results` as Route);
				router.refresh();
			},
		}),
	);

	const handleSend = async () => {
		if (
			!inputValue.trim() ||
			newMessage.isPending ||
			finishInterview.isPending
		) {
			return;
		}

		setMessages((currentMessages) => [
			...currentMessages,
			{
				id: crypto.randomUUID(),
				isAi: false,
				messageText: inputValue,
				createdAt: new Date(),
			},
		]);

		await newMessage.mutateAsync({ sessionId, content: inputValue });
	};

	const handleFinish = async () => {
		if (finishInterview.isPending) return;

		await finishInterview.mutateAsync(sessionId);
	};

	return {
		messages,
		inputValue,
		setInputValue,
		isSending: newMessage.isPending,
		isFinishing: finishInterview.isPending,
		messagesEndRef,
		handleSend,
		handleFinish,
	};
}
