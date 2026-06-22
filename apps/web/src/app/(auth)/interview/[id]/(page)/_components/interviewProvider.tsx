"use client";

import { createContext, useContext } from "react";
import { useInterview } from "../_hooks/useInterview";
import type { Message } from "../_utils/type";

type InterviewProviderProps = {
	children: React.ReactNode;
	interviewId: string;
	initialMessages: Message[];
};

type InterviewContextValue = ReturnType<typeof useInterview>;

const InterviewContext = createContext<InterviewContextValue | null>(null);

export function InterviewProvider({
	children,
	interviewId,
	initialMessages,
}: InterviewProviderProps) {
	const value = useInterview(interviewId, initialMessages);

	return (
		<InterviewContext.Provider value={value}>
			{children}
		</InterviewContext.Provider>
	);
}

export function useInterviewContext() {
	const context = useContext(InterviewContext);

	if (!context) {
		throw new Error(
			"useInterviewContext must be used within InterviewProvider",
		);
	}

	return context;
}
