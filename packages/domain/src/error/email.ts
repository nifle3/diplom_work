import { DomainError } from "./base";

type EmailProvider = "resend";

type EmailConfigurationPayload = {
	provider: EmailProvider;
	reason: "missing_api_key" | "missing_from_address";
};

type EmailDeliveryReason =
	| "network"
	| "unauthorized"
	| "forbidden"
	| "rate_limited"
	| "invalid_request"
	| "provider_error"
	| "unknown";

type EmailDeliveryPayload = {
	provider: EmailProvider;
	reason: EmailDeliveryReason;
	statusCode?: number;
	responseBody?: string;
};

export class EmailConfigurationError extends DomainError<EmailConfigurationPayload> {
	constructor(message: string, payload: EmailConfigurationPayload) {
		super(message, payload);
		this.name = "EmailConfigurationError";
		Object.setPrototypeOf(this, EmailConfigurationError.prototype);
	}
}

export class EmailDeliveryError extends DomainError<EmailDeliveryPayload> {
	constructor(message: string, payload: EmailDeliveryPayload) {
		super(message, payload);
		this.name = "EmailDeliveryError";
		Object.setPrototypeOf(this, EmailDeliveryError.prototype);
	}
}
