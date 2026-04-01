export type SandboxScript = {
	id: string;
	title: string | null;
	context: string | null;
	categoryName: string | null;
	createdAt: Date | null;
	isDraft: boolean;
};

export type SandboxSelectedScript = {
	id: string;
	title: string | null;
	description: string;
	context: string | null;
};

export type SandboxMessage = {
	id: string;
	isAi: boolean;
	messageText: string;
	analysisNote: string | null;
	createdAt: Date;
};

export type SandboxSession = {
	id: string;
	currentQuestionIndex: number;
	startedAt: Date;
	summarize: string | null;
	script: {
		id: string;
		title: string | null;
		description: string;
		context: string | null;
		questions: Array<{
			text: string;
			specificCriteria: Array<{
				content: string;
			}>;
		}>;
	};
	messages: SandboxMessage[];
	finalEvaluation?: null | {
		score: number;
		feedback: string;
		analysisNote: string;
		strengths: string[];
		improvements: string[];
	};
};
