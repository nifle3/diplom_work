import { EmailDeliveryError } from "@diplom_work/domain/error";

/**
 * Creates a function to handle password reset emails.
 * Separated for easier testing by injecting email and logger dependencies.
 */
export const createSendResetPassword = (deps: {
	email: { sendPasswordReset: (opts: { to: string; resetUrl: string }) => Promise<void> };
	logger: { error: (obj: object, msg: string) => void };
}) => {
	return async ({ user, url }: { user: { email: string }; url: string }) => {
		try {
			await deps.email.sendPasswordReset({
				to: user.email,
				resetUrl: url,
			});
		} catch (err: unknown) {
			if (err instanceof EmailDeliveryError) {
				deps.logger.error(
					{ email: user.email, payload: err.payload },
					"Password reset email delivery failed",
				);
			}
		}
	};
};
