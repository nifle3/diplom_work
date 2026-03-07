import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

import type { Message } from "../_utils/type";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";

export function useInterview(initialMessages: Message[]) {
	const [messages, setMessages] = useState<Message[]>(initialMessages);
	const [inputValue, setInputValue] = useState("");
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const newMessage = useMutation(trpc.session.addNewMessage.mutationOptions({
		onSuccess: (val) => {
			setInputValue("");
		},
		onError: (error) => {
			toast(error.message);
		},
	}));

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages, newMessage.isPending]);

	const handleSend = async () => {
		if (!inputValue.trim() || newMessage.isPending) return;
		await newMessage.mutateAsync();
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