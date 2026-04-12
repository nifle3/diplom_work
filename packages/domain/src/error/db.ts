import { DomainError } from "./base";

// ---- DbNotFoundError ----
// Thrown explicitly in application code when a query returns no rows
// (e.g., findFirst() returns undefined).

type DbNotFoundPayload = {
	table: string;
	id?: string | number;
};

export class DbNotFoundError extends DomainError<DbNotFoundPayload> {
	constructor(message: string, payload: DbNotFoundPayload) {
		super(message, payload);
		this.name = "DbNotFoundError";
		Object.setPrototypeOf(this, DbNotFoundError.prototype);
	}
}

// ---- DbUniqueConstraintError ----
// Mapped from PostgreSQL error code 23505 (unique_violation).

type DbUniqueConstraintPayload = {
	constraint?: string;
	table?: string;
	column?: string;
	detail?: string;
};

export class DbUniqueConstraintError extends DomainError<DbUniqueConstraintPayload> {
	constructor(message: string, payload: DbUniqueConstraintPayload) {
		super(message, payload);
		this.name = "DbUniqueConstraintError";
		Object.setPrototypeOf(this, DbUniqueConstraintError.prototype);
	}
}

// ---- DbForeignKeyConstraintError ----
// Mapped from PostgreSQL error code 23503 (foreign_key_violation).

type DbForeignKeyConstraintPayload = {
	constraint?: string;
	table?: string;
	detail?: string;
};

export class DbForeignKeyConstraintError extends DomainError<DbForeignKeyConstraintPayload> {
	constructor(message: string, payload: DbForeignKeyConstraintPayload) {
		super(message, payload);
		this.name = "DbForeignKeyConstraintError";
		Object.setPrototypeOf(this, DbForeignKeyConstraintError.prototype);
	}
}

// ---- DbCheckConstraintError ----
// Mapped from PostgreSQL error code 23514 (check_violation).

type DbCheckConstraintPayload = {
	constraint?: string;
	table?: string;
	detail?: string;
};

export class DbCheckConstraintError extends DomainError<DbCheckConstraintPayload> {
	constructor(message: string, payload: DbCheckConstraintPayload) {
		super(message, payload);
		this.name = "DbCheckConstraintError";
		Object.setPrototypeOf(this, DbCheckConstraintError.prototype);
	}
}

// ---- DbConnectionError ----
// Mapped from PostgreSQL connection error codes and Node.js socket errors.

export type DbConnectionReason =
	| "connection_refused"
	| "authentication_failed"
	| "admin_shutdown"
	| "timeout"
	| "unknown";

type DbConnectionPayload = {
	reason: DbConnectionReason;
};

export class DbConnectionError extends DomainError<DbConnectionPayload> {
	constructor(message: string, payload: DbConnectionPayload) {
		super(message, payload);
		this.name = "DbConnectionError";
		Object.setPrototypeOf(this, DbConnectionError.prototype);
	}
}

// ---- DbQueryError ----
// Fallback for all other database errors that are not specifically handled.

type DbQueryPayload = {
	code?: string;
};

export class DbQueryError extends DomainError<DbQueryPayload> {
	constructor(message: string, payload: DbQueryPayload) {
		super(message, payload);
		this.name = "DbQueryError";
		Object.setPrototypeOf(this, DbQueryError.prototype);
	}
}
