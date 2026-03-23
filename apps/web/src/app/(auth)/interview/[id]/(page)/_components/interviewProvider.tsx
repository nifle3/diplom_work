"use client";

import { createContext, useContext } from "react";
import { useInterview } from "../_hooks/useInterview";

type InterviewProviderProps = {
	children: React.ReactNode;
	interviewId: string;
};

type InterviewContextValue = ReturnType<typeof useInterview>;

const InterviewContext = createContext<InterviewContextValue | null>(null);

export function InterviewProvider({
	children,
	interviewId,
}: InterviewProviderProps) {
	const value = useInterview(interviewId);

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
