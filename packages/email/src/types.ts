export type SendEmailInput = {
	to: string | string[];
	subject: string;
	html: string;
	text?: string;
	from?: string;
};

export type SendPasswordResetEmailInput = {
	to: string;
	resetUrl: string;
};

export interface EmailService {
	send(input: SendEmailInput): Promise<void>;
	sendPasswordReset(input: SendPasswordResetEmailInput): Promise<void>;
}
