import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import type { Message } from "../_utils/type";

export function useInterview(sessionId: string) {
	const [messages, setMessages] = useState<Message[]>([]);
	const [inputValue, setInputValue] = useState("");
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
		messagesEndRef.current?.scrollIntoView({ behavior });
	};

	const newMessage = useMutation(
		trpc.session.addNewMessage.mutationOptions({
			onSuccess: (message) => {
				setInputValue("");
				setMessages((currentMessages) => [...currentMessages, message]);
				scrollToBottom("auto");
			},
			onError: (error) => {
				toast(error.message);
			},
		}),
	);

	const handleSend = async () => {
		if (!inputValue.trim() || newMessage.isPending) return;

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

	return {
		messages,
		inputValue,
		setInputValue,
		isSending: newMessage.isPending,
		messagesEndRef,
		handleSend,
	};
}
