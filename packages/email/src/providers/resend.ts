import {
	EmailConfigurationError,
	EmailDeliveryError,
} from "@diplom_work/domain/error";
import { env } from "@diplom_work/env/server";
import { client } from "../client";
import type { SendEmailInput } from "../types";

export async function sendViaResend({
	to,
	subject,
	html,
	text,
}: SendEmailInput) {
	try {
		const { data, error } = await client.emails.send({
			from: env.EMAIL_FROM,
			to: Array.isArray(to) ? to : [to],
			subject,
			html,
			text,
		});

		if (error) {
			throw new EmailDeliveryError("Email provider returned an error", {
				provider: "resend",
				reason: "provider_error",
				responseBody: JSON.stringify(error),
			});
		}

		return data.id;
	} catch (err) {
		if (
			err instanceof EmailDeliveryError ||
			err instanceof EmailConfigurationError
		) {
			throw err;
		}

		throw new EmailDeliveryError("Failed to send email via Resend", {
			provider: "resend",
			reason: "network",
			responseBody: err instanceof Error ? err.message : String(err),
		});
	}
}
