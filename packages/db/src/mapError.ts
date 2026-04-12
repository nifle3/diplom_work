import {
	DbCheckConstraintError,
	DbConnectionError,
	type DbConnectionReason,
	DbForeignKeyConstraintError,
	DbQueryError,
	DbUniqueConstraintError,
} from "@diplom_work/domain/error";

// PostgreSQL SQLSTATE error codes
const PG_UNIQUE_VIOLATION = "23505";
const PG_FOREIGN_KEY_VIOLATION = "23503";
const PG_CHECK_VIOLATION = "23514";

// PostgreSQL connection-level SQLSTATE codes
const PG_CONNECTION_ERROR_CODES = new Set([
	"08000", // connection_exception
	"08003", // connection_does_not_exist
	"08006", // connection_failure
	"57P01", // admin_shutdown
]);

// PostgreSQL authentication SQLSTATE codes
const PG_AUTH_ERROR_CODES = new Set([
	"28000", // invalid_authorization_specification
	"28P01", // invalid_password
]);

// Node.js socket-level error codes
const NODE_CONNECTION_REFUSED_CODES = new Set([
	"ECONNREFUSED",
	"ECONNRESET",
	"ENOTFOUND",
]);

// A structural description of the extra fields pg attaches to Error objects.
// We do NOT import pg's DatabaseError to avoid a hard runtime dependency on the
// specific driver flavour (node-postgres vs @neondatabase/serverless).
interface PgLikeError {
	readonly code?: string;
	readonly constraint?: string;
	readonly table?: string;
	readonly column?: string;
	readonly detail?: string;
	readonly schema?: string;
}

/**
 * Returns true when `error` carries the extra fields that both node-postgres
 * and @neondatabase/serverless attach to their Error objects.
 */
function isPgLikeError(error: unknown): error is Error & PgLikeError {
	if (!(error instanceof Error)) return false;

	const candidate = error as Partial<PgLikeError>;

	// At least one pg-specific field must be present to avoid false positives
	// with unrelated errors that happen to have a `code` property.
	return (
		typeof candidate.constraint === "string" ||
		typeof candidate.table === "string" ||
		typeof candidate.detail === "string" ||
		// pg uses 5-char SQLSTATE codes or short all-caps Node.js codes
		typeof candidate.code === "string"
	);
}

function resolveConnectionReason(code: string): DbConnectionReason {
	if (
		PG_CONNECTION_ERROR_CODES.has(code) ||
		NODE_CONNECTION_REFUSED_CODES.has(code)
	) {
		return "connection_refused";
	}
	if (PG_AUTH_ERROR_CODES.has(code)) {
		return "authentication_failed";
	}
	if (code === "57P01") {
		return "admin_shutdown";
	}
	if (code === "ETIMEDOUT") {
		return "timeout";
	}
	return "unknown";
}

/**
 * Maps a raw database driver error to the appropriate typed domain error and
 * re-throws it. Always throws — the return type `never` enforces this.
 *
 * Usage in a router or service:
 * ```ts
 * try {
 *   return await db.insert(users).values(data);
 * } catch (error) {
 *   mapDbError(error);
 * }
 * ```
 */
export function mapDbError(error: unknown): never {
	if (isPgLikeError(error)) {
		const { code, constraint, table, column, detail } = error;

		if (code === PG_UNIQUE_VIOLATION) {
			throw new DbUniqueConstraintError(error.message, {
				constraint,
				table,
				column,
				detail,
			});
		}

		if (code === PG_FOREIGN_KEY_VIOLATION) {
			throw new DbForeignKeyConstraintError(error.message, {
				constraint,
				table,
				detail,
			});
		}

		if (code === PG_CHECK_VIOLATION) {
			throw new DbCheckConstraintError(error.message, {
				constraint,
				table,
				detail,
			});
		}

		if (
			code !== undefined &&
			(PG_CONNECTION_ERROR_CODES.has(code) ||
				PG_AUTH_ERROR_CODES.has(code) ||
				NODE_CONNECTION_REFUSED_CODES.has(code) ||
				code === "ETIMEDOUT")
		) {
			throw new DbConnectionError(error.message, {
				reason: resolveConnectionReason(code),
			});
		}

		throw new DbQueryError(error.message, { code });
	}

	throw new DbQueryError(
		error instanceof Error ? error.message : "Unknown database error",
		{ code: undefined },
	);
}
