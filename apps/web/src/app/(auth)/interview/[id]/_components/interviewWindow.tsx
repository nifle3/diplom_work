"use client";

interface Message {
	id: string;
	isAi: boolean;
	text: string;
	timestamp: Date;
}

interface InterviewWindowProps {
	scriptId: string;
}

export default function InterviewWindow({ scriptId } : InterviewWindowProps) {
	return (
		<h1>Test</h1>
	)
}

