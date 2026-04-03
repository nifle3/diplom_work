import { EmailDeliveryError } from "@diplom_work/domain/error";
import { describe, expect, it, vi } from "vitest";
import { createSendResetPassword } from "./email";

describe("createSendResetPassword", () => {
	it("should send a password reset email correctly", async () => {
		const mockEmail = {
			sendPasswordReset: vi.fn().mockResolvedValue(undefined),
		};
		const mockLogger = {
			error: vi.fn(),
		};

		const sendResetPassword = createSendResetPassword({
			email: mockEmail,
			logger: mockLogger,
		});

		const user = { email: "test@example.com" };
		const url = "https://example.com/reset-password";

		await sendResetPassword({ user, url });

		expect(mockEmail.sendPasswordReset).toHaveBeenCalledWith({
			to: user.email,
			resetUrl: url,
		});
		expect(mockLogger.error).not.toHaveBeenCalled();
	});

	it("should log an error when EmailDeliveryError is thrown", async () => {
		const errorPayload = {
			provider: "resend" as const,
			reason: "unknown" as const,
		};
		const deliveryError = new EmailDeliveryError(
			"Delivery failed",
			errorPayload,
		);

		const mockEmail = {
			sendPasswordReset: vi.fn().mockRejectedValue(deliveryError),
		};
		const mockLogger = {
			error: vi.fn(),
		};

		const sendResetPassword = createSendResetPassword({
			email: mockEmail,
			logger: mockLogger,
		});

		const user = { email: "test@example.com" };
		const url = "https://example.com/reset-password";

		await sendResetPassword({ user, url });

		expect(mockLogger.error).toHaveBeenCalledWith(
			expect.objectContaining({
				email: user.email,
				payload: errorPayload,
			}),
			"Password reset email delivery failed",
		);
	});

	it("should not log an error for other types of errors", async () => {
		const mockEmail = {
			sendPasswordReset: vi.fn().mockRejectedValue(new Error("Generic error")),
		};
		const mockLogger = {
			error: vi.fn(),
		};

		const sendResetPassword = createSendResetPassword({
			email: mockEmail,
			logger: mockLogger,
		});

		await sendResetPassword({
			user: { email: "test@example.com" },
			url: "https://example.com/reset-password",
		});

		expect(mockLogger.error).not.toHaveBeenCalled();
	});
});
