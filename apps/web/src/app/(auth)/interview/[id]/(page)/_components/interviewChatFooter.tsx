"use client";

import { ChatInput } from "./chatInput";
import { INTERVIEW_ANSWER_MAX_LENGTH } from "../_hooks/useInterview";
import { useInterviewContext } from "./interviewProvider";

export function InterviewChatFooter() {
	const {
		inputValue,
		setInputValue,
		handleSend,
		isSending,
		isFinishing,
		isCanceling,
		sttSupported,
		ttsSupported,
		isListening,
		isSpeaking,
		ttsEnabled,
		setTtsEnabled,
		toggleListening,
		speakLastAiMessage,
	} = useInterviewContext();
	const isBusy = isSending || isFinishing || isCanceling;

	return (
		<ChatInput
			value={inputValue}
			onChange={setInputValue}
			onSend={handleSend}
			disabled={isBusy}
			maxLength={INTERVIEW_ANSWER_MAX_LENGTH}
			sttSupported={sttSupported}
			ttsSupported={ttsSupported}
			isListening={isListening}
			isSpeaking={isSpeaking}
			ttsEnabled={ttsEnabled}
			onToggleListening={toggleListening}
			onToggleTts={() => setTtsEnabled((current) => !current)}
			onSpeakLastAiMessage={speakLastAiMessage}
		/>
	);
}
