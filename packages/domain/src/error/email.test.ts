import { describe, expect, it } from "vitest";

import { DomainError } from "./base";
import {
	EmailConfigurationError,
	EmailDeliveryError,
} from "./email";

describe("EmailConfigurationError", () => {
	it("sets the class name and preserves the payload", () => {
		const payload = {
			provider: "resend" as const,
			reason: "missing_api_key" as const,
		};
		const error = new EmailConfigurationError(
			"Missing API key",
			payload,
		);

		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(DomainError);
		expect(error).toBeInstanceOf(EmailConfigurationError);
		expect(error.name).toBe("EmailConfigurationError");
		expect(error.message).toBe("Missing API key");
		expect(error.payload).toEqual(payload);
		expect(Object.getPrototypeOf(error)).toBe(
			EmailConfigurationError.prototype,
		);
	});
});

describe("EmailDeliveryError", () => {
	it("sets the class name and preserves optional payload fields", () => {
		const payload = {
			provider: "resend" as const,
			reason: "provider_error" as const,
			statusCode: 502,
			responseBody: "bad gateway",
		};
		const error = new EmailDeliveryError("Provider error", payload);

		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(DomainError);
		expect(error).toBeInstanceOf(EmailDeliveryError);
		expect(error.name).toBe("EmailDeliveryError");
		expect(error.message).toBe("Provider error");
		expect(error.payload).toEqual(payload);
		expect(Object.getPrototypeOf(error)).toBe(EmailDeliveryError.prototype);
	});
});
