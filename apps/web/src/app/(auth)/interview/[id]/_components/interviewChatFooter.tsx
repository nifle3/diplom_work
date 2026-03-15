"use client";

import { useInterviewContext } from "./interviewProvider";
import { ChatInput } from "./chatInput";

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
