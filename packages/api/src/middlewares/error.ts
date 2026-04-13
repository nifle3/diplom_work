import { TRPCError, type TRPC_ERROR_CODE_KEY } from "@trpc/server";
import { t } from "../init/trpc";

type DomainErrorLike = Error & {
	payload?: unknown;
};

function isDomainError(error: unknown): error is DomainErrorLike {
	return error instanceof Error && "payload" in error;
}

function getDomainError(error: unknown): DomainErrorLike | null {
	if (isDomainError(error)) {
		return error;
	}

	if (error instanceof TRPCError && error.cause) {
		return isDomainError(error.cause) ? error.cause : null;
	}

	return null;
}

function resolveEmailDeliveryCode(payload: unknown): TRPC_ERROR_CODE_KEY {
	if (
		typeof payload === "object" &&
		payload !== null &&
		"reason" in payload &&
		(payload as { reason: unknown }).reason === "rate_limited"
	) {
		return "TOO_MANY_REQUESTS";
	}
	return "INTERNAL_SERVER_ERROR";
}

/**
 * Maps a domain error name to the tRPC error code that best represents it.
 * Add new entries here when new domain error classes are introduced.
 */
function resolveCode(error: DomainErrorLike): TRPC_ERROR_CODE_KEY {
	switch (error.name) {
		// Email
		case "EmailDeliveryError":
			return resolveEmailDeliveryCode(error.payload);
		case "EmailConfigurationError":
			return "INTERNAL_SERVER_ERROR";

		// File / Storage
		case "FileTooLarge":
			return "PAYLOAD_TOO_LARGE";
		case "StorageError":
			return "INTERNAL_SERVER_ERROR";

		// Database
		case "DbNotFoundError":
			return "NOT_FOUND";
		case "DbUniqueConstraintError":
			return "CONFLICT";
		case "DbForeignKeyConstraintError":
			return "BAD_REQUEST";
		case "DbCheckConstraintError":
			return "BAD_REQUEST";
		case "DbConnectionError":
			return "INTERNAL_SERVER_ERROR";
		case "DbQueryError":
			return "INTERNAL_SERVER_ERROR";

		default:
			return "BAD_REQUEST";
	}
}

export const errorMiddleware = t.middleware(async ({ next }) => {
	const result = await next();

	if (result.ok) {
		return result;
	}

	const domainError = getDomainError(result.error);
	if (domainError) {
		throw new TRPCError({
			code: resolveCode(domainError),
			message: domainError.message,
			cause: domainError.cause,
		});
	}

	throw result.error;
});
