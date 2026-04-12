import { describe, expect, it } from "vitest";

import { DomainError } from "./base";
import {
	DbCheckConstraintError,
	DbConnectionError,
	DbForeignKeyConstraintError,
	DbNotFoundError,
	DbQueryError,
	DbUniqueConstraintError,
} from "./db";

describe("DbNotFoundError", () => {
	it("sets the class name, message, and payload", () => {
		const payload = { table: "users", id: "42" };
		const error = new DbNotFoundError("User not found", payload);

		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(DomainError);
		expect(error).toBeInstanceOf(DbNotFoundError);
		expect(error.name).toBe("DbNotFoundError");
		expect(error.message).toBe("User not found");
		expect(error.payload).toEqual(payload);
		expect(Object.getPrototypeOf(error)).toBe(DbNotFoundError.prototype);
	});

	it("allows omitting the optional id field", () => {
		const error = new DbNotFoundError("Script not found", { table: "scripts" });

		expect(error.payload).toEqual({ table: "scripts" });
		expect(error.payload?.id).toBeUndefined();
	});
});

describe("DbUniqueConstraintError", () => {
	it("sets the class name and full payload", () => {
		const payload = {
			constraint: "users_email_unique",
			table: "users",
			column: "email",
			detail: "Key (email)=(test@example.com) already exists.",
		};
		const error = new DbUniqueConstraintError(
			"Unique constraint violated",
			payload,
		);

		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(DomainError);
		expect(error).toBeInstanceOf(DbUniqueConstraintError);
		expect(error.name).toBe("DbUniqueConstraintError");
		expect(error.message).toBe("Unique constraint violated");
		expect(error.payload).toEqual(payload);
		expect(Object.getPrototypeOf(error)).toBe(DbUniqueConstraintError.prototype);
	});

	it("allows a payload with only optional fields omitted", () => {
		const error = new DbUniqueConstraintError("Duplicate", {});

		expect(error.payload).toEqual({});
	});
});

describe("DbForeignKeyConstraintError", () => {
	it("sets the class name and full payload", () => {
		const payload = {
			constraint: "sessions_user_id_fk",
			table: "sessions",
			detail: "Key (user_id)=(999) is not present in table 'users'.",
		};
		const error = new DbForeignKeyConstraintError(
			"Foreign key constraint violated",
			payload,
		);

		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(DomainError);
		expect(error).toBeInstanceOf(DbForeignKeyConstraintError);
		expect(error.name).toBe("DbForeignKeyConstraintError");
		expect(error.message).toBe("Foreign key constraint violated");
		expect(error.payload).toEqual(payload);
		expect(Object.getPrototypeOf(error)).toBe(
			DbForeignKeyConstraintError.prototype,
		);
	});
});

describe("DbCheckConstraintError", () => {
	it("sets the class name and full payload", () => {
		const payload = {
			constraint: "users_age_check",
			table: "users",
			detail: "Failing row contains age=-1.",
		};
		const error = new DbCheckConstraintError(
			"Check constraint violated",
			payload,
		);

		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(DomainError);
		expect(error).toBeInstanceOf(DbCheckConstraintError);
		expect(error.name).toBe("DbCheckConstraintError");
		expect(error.message).toBe("Check constraint violated");
		expect(error.payload).toEqual(payload);
		expect(Object.getPrototypeOf(error)).toBe(DbCheckConstraintError.prototype);
	});
});

describe("DbConnectionError", () => {
	it("sets the class name and connection reason", () => {
		const error = new DbConnectionError("Connection refused", {
			reason: "connection_refused",
		});

		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(DomainError);
		expect(error).toBeInstanceOf(DbConnectionError);
		expect(error.name).toBe("DbConnectionError");
		expect(error.message).toBe("Connection refused");
		expect(error.payload).toEqual({ reason: "connection_refused" });
		expect(Object.getPrototypeOf(error)).toBe(DbConnectionError.prototype);
	});

	it("accepts all valid connection reasons", () => {
		const reasons = [
			"connection_refused",
			"authentication_failed",
			"admin_shutdown",
			"timeout",
			"unknown",
		] as const;

		for (const reason of reasons) {
			const error = new DbConnectionError("Connection error", { reason });
			expect(error.payload?.reason).toBe(reason);
		}
	});
});

describe("DbQueryError", () => {
	it("sets the class name and pg error code", () => {
		const error = new DbQueryError("Query failed", { code: "42P01" });

		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(DomainError);
		expect(error).toBeInstanceOf(DbQueryError);
		expect(error.name).toBe("DbQueryError");
		expect(error.message).toBe("Query failed");
		expect(error.payload).toEqual({ code: "42P01" });
		expect(Object.getPrototypeOf(error)).toBe(DbQueryError.prototype);
	});

	it("allows an undefined code for unknown errors", () => {
		const error = new DbQueryError("Unknown query error", {
			code: undefined,
		});

		expect(error.payload?.code).toBeUndefined();
	});
});
