import {
	EmailConfigurationError,
	EmailDeliveryError,
} from "@diplom_work/domain/error";
import { env } from "@diplom_work/env/server";
import type { SendEmailInput } from "../types";

const RESEND_API_URL = "https://api.resend.com/emails";

function resolveRecipients(to: string | string[]) {
	return Array.isArray(to) ? to : [to];
}

function assertResendConfig(from?: string) {
	if (!env.RESEND_API_KEY) {
		throw new EmailConfigurationError("Resend API key is not configured", {
			provider: "resend",
			reason: "missing_api_key",
		});
	}

	if (!(from ?? env.EMAIL_FROM)) {
		throw new EmailConfigurationError("Email from address is not configured", {
			provider: "resend",
			reason: "missing_from_address",
		});
	}
}

function mapStatusToReason(status: number) {
	if (status === 401) return "unauthorized" as const;
	if (status === 403) return "forbidden" as const;
	if (status === 429) return "rate_limited" as const;
	if (status >= 400 && status < 500) return "invalid_request" as const;
	if (status >= 500) return "provider_error" as const;
	return "unknown" as const;
}

export async function sendViaResend({
	from = env.EMAIL_FROM,
	to,
	subject,
	html,
	text,
}: SendEmailInput) {
	assertResendConfig(from);

	let response: Response;

	try {
		response = await fetch(RESEND_API_URL, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${env.RESEND_API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				from,
				to: resolveRecipients(to),
				subject,
				html,
				text,
			}),
		});
	} catch (error) {
		throw new EmailDeliveryError("Failed to reach email provider", {
			provider: "resend",
			reason: "network",
			responseBody: error instanceof Error ? error.message : String(error),
		});
	}

	if (!response.ok) {
		const responseBody = await response.text();
		throw new EmailDeliveryError("Email provider rejected the request", {
			provider: "resend",
			reason: mapStatusToReason(response.status),
			statusCode: response.status,
			responseBody,
		});
	}
}
