"use client";

import { ChatInput } from "./chatInput";
import { useInterviewContext } from "./interviewProvider";

export function InterviewChatFooter() {
	const { inputValue, setInputValue, handleSend, isSending } =
		useInterviewContext();

	return (
		<ChatInput
			value={inputValue}
			onChange={setInputValue}
			onSend={handleSend}
			disabled={isSending}
		/>
	);
}
