import { sendViaResend } from "./providers/resend";
import {
	buildPasswordResetHtml,
	buildPasswordResetText,
} from "./templates/passwordReset";
import type {
	EmailService,
	SendEmailInput,
	SendPasswordResetEmailInput,
} from "./types";

async function send(input: SendEmailInput) {
	await sendViaResend(input);
}

async function sendPasswordReset({
	to,
	resetUrl,
}: SendPasswordResetEmailInput) {
	await sendViaResend({
		to,
		subject: "Восстановление пароля",
		html: buildPasswordResetHtml(resetUrl),
		text: buildPasswordResetText(resetUrl),
	});
}

export const email: EmailService = {
	send,
	sendPasswordReset,
};
