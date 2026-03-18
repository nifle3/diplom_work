import { TRPCError } from "@trpc/server";
import { t } from "../init/trpc";

type DomainErrorLike = Error & {
	payload?: unknown;
};

function isDomainError(error: unknown): error is DomainErrorLike {
	return error instanceof Error && "payload" in error;
}

export const errorMiddleware = t.middleware(async ({ next }) => {
	try {
		return await next();
	} catch (error) {
		if (error instanceof TRPCError) {
			throw error;
		}

		if (isDomainError(error)) {
			if (error.name === "EmailDeliveryError") {
				const code =
					typeof error.payload === "object" &&
					error.payload !== null &&
					"reason" in error.payload &&
					error.payload.reason === "rate_limited"
						? "TOO_MANY_REQUESTS"
						: "INTERNAL_SERVER_ERROR";

				throw new TRPCError({
					code,
					message: error.message,
					cause: error,
				});
			}

			if (error.name === "EmailConfigurationError") {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: error.message,
					cause: error,
				});
			}

			if (error.name === "FileTooLarge") {
				throw new TRPCError({
					code: "PAYLOAD_TOO_LARGE",
					message: error.message,
					cause: error,
				});
			}

			if (error.name === "StorageError") {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: error.message,
					cause: error,
				});
			}

			throw new TRPCError({
				code: "BAD_REQUEST",
				message: error.message,
				cause: error,
			});
		}

		throw error;
	}
});
