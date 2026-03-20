"use client";

import { useInterviewContext } from "./interviewProvider";
import { MessageItem } from "./messageItem";
import { TypingIndicator } from "./typingIndicator";

export function InterviewLiveMessages() {
	const { messages, isSending, messagesEndRef } = useInterviewContext();

	return (
		<>
			{messages.map((message) => (
				<MessageItem key={message.id} message={message} />
			))}

			{isSending && <TypingIndicator />}

			<div ref={messagesEndRef} className="h-4" />
		</>
	);
}
