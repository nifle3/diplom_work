export type Message = {
	id: string;
	isAi: boolean;
	messageText: string;
	analysisNote: string | null;
	createdAt: Date;
};
