import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import type { Message } from "../_utils/type";

export function useInterview(initialMessages: Message[], sessionId: string) {
	const [messages, _setMessages] = useState<Message[]>(initialMessages);
	const [inputValue, setInputValue] = useState("");
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const newMessage = useMutation(
		trpc.session.addNewMessage.mutationOptions({
			onSuccess: (_val) => {
				setInputValue("");
			},
			onError: (error) => {
				toast(error.message);
			},
		}),
	);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [scrollToBottom]);

	const handleSend = async () => {
		if (!inputValue.trim() || newMessage.isPending) return;
		await newMessage.mutateAsync({ sessionId });
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
