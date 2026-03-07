import { useState, useEffect, useRef } from "react";

import type { Message } from "../_utils/type";

export function useInterview(initialMessages: Message[]) {
	const [messages, setMessages] = useState<Message[]>(initialMessages);
	const [inputValue, setInputValue] = useState("");
	const [isSending, setIsSending] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages, isSending]);

	const handleSend = async (callback?: (val: string) => Promise<void>) => {
		if (!inputValue.trim() || isSending) return;

		const userMessage: Message = {
			id: Date.now().toString(),
			isAi: false,
			messageText: inputValue.trim(),
			createdAt: new Date(),
		};

		setMessages((prev) => [...prev, userMessage]);
		setInputValue("");
		setIsSending(true);

		try {
			if (callback) await callback(userMessage.messageText);
		} finally {
			setIsSending(false);
		}
	};

	return {
		messages,
		inputValue,
		setInputValue,
		isSending,
		messagesEndRef,
		handleSend,
	};
}