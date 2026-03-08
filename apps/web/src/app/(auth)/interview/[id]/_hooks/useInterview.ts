import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import type { Message } from "../_utils/type";

export function useInterview(initialMessages: Message[], sessionId: string) {
	const [messages, setMessages] = useState<Message[]>(initialMessages);
	const [inputValue, setInputValue] = useState("");
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const newMessage = useMutation(
		trpc.session.addNewMessage.mutationOptions({
			onSuccess: (val) => {
				setInputValue("");
				setMessages([...messages, val]);
			},
			onError: (error) => {
				toast(error.message);
			},
		}),
	);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	const handleSend = async () => {
		if (!inputValue.trim() || newMessage.isPending) return;
		setMessages([
			...messages,
			{
				id: crypto.randomUUID(),
				isAi: false,
				messageText: inputValue,
				createdAt: new Date(),
			},
		]);
		await newMessage.mutateAsync({ sessionId, content: inputValue });
		scrollToBottom();
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
