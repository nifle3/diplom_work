import "dotenv/config";

export { email } from "./service";
export type {
	EmailService,
	SendEmailInput,
	SendPasswordResetEmailInput,
} from "./types";
