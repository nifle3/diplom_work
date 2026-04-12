import {
	DbCheckConstraintError,
	DbConnectionError,
	DbForeignKeyConstraintError,
	DbQueryError,
	DbUniqueConstraintError,
} from "@diplom_work/domain/error";
import { describe, expect, it } from "vitest";

import { mapDbError } from "./mapError";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePgError(
	message: string,
	fields: {
		code?: string;
		constraint?: string;
		table?: string;
		column?: string;
		detail?: string;
	},
): Error {
	const error = new Error(message) as Error & typeof fields;
	Object.assign(error, fields);
	return error;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("mapDbError — unique constraint (23505)", () => {
	it("maps to DbUniqueConstraintError with all available fields", () => {
		const raw = makePgError("duplicate key value violates unique constraint", {
			code: "23505",
			constraint: "users_email_unique",
			table: "users",
			column: "email",
			detail: "Key (email)=(test@example.com) already exists.",
		});

		expect(() => mapDbError(raw)).toThrow(DbUniqueConstraintError);

		try {
			mapDbError(raw);
		} catch (error) {
			expect(error).toBeInstanceOf(DbUniqueConstraintError);
			const e = error as DbUniqueConstraintError;
			expect(e.name).toBe("DbUniqueConstraintError");
			expect(e.message).toBe(
				"duplicate key value violates unique constraint",
			);
			expect(e.payload).toEqual({
				constraint: "users_email_unique",
				table: "users",
				column: "email",
				detail: "Key (email)=(test@example.com) already exists.",
			});
		}
	});

	it("maps to DbUniqueConstraintError even when optional fields are absent", () => {
		const raw = makePgError("unique violation", { code: "23505" });

		expect(() => mapDbError(raw)).toThrow(DbUniqueConstraintError);
	});
});

describe("mapDbError — foreign key constraint (23503)", () => {
	it("maps to DbForeignKeyConstraintError with all available fields", () => {
		const raw = makePgError(
			"insert or update on table violates foreign key constraint",
			{
				code: "23503",
				constraint: "sessions_user_id_fk",
				table: "sessions",
				detail: "Key (user_id)=(999) is not present in table 'users'.",
			},
		);

		expect(() => mapDbError(raw)).toThrow(DbForeignKeyConstraintError);

		try {
			mapDbError(raw);
		} catch (error) {
			expect(error).toBeInstanceOf(DbForeignKeyConstraintError);
			const e = error as DbForeignKeyConstraintError;
			expect(e.name).toBe("DbForeignKeyConstraintError");
			expect(e.payload).toEqual({
				constraint: "sessions_user_id_fk",
				table: "sessions",
				detail: "Key (user_id)=(999) is not present in table 'users'.",
			});
		}
	});
});

describe("mapDbError — check constraint (23514)", () => {
	it("maps to DbCheckConstraintError with all available fields", () => {
		const raw = makePgError(
			"new row for relation violates check constraint",
			{
				code: "23514",
				constraint: "users_age_check",
				table: "users",
				detail: "Failing row contains age=-1.",
			},
		);

		expect(() => mapDbError(raw)).toThrow(DbCheckConstraintError);

		try {
			mapDbError(raw);
		} catch (error) {
			expect(error).toBeInstanceOf(DbCheckConstraintError);
			const e = error as DbCheckConstraintError;
			expect(e.name).toBe("DbCheckConstraintError");
			expect(e.payload).toEqual({
				constraint: "users_age_check",
				table: "users",
				detail: "Failing row contains age=-1.",
			});
		}
	});
});

describe("mapDbError — connection errors", () => {
	it.each([
		{ code: "08000", expectedReason: "connection_refused" },
		{ code: "08003", expectedReason: "connection_refused" },
		{ code: "08006", expectedReason: "connection_refused" },
		{ code: "28000", expectedReason: "authentication_failed" },
		{ code: "28P01", expectedReason: "authentication_failed" },
		{ code: "ECONNREFUSED", expectedReason: "connection_refused" },
		{ code: "ECONNRESET", expectedReason: "connection_refused" },
		{ code: "ENOTFOUND", expectedReason: "connection_refused" },
		{ code: "ETIMEDOUT", expectedReason: "timeout" },
	])(
		"maps code $code to DbConnectionError with reason $expectedReason",
		({ code, expectedReason }) => {
			const raw = makePgError("connection error", { code });

			expect(() => mapDbError(raw)).toThrow(DbConnectionError);

			try {
				mapDbError(raw);
			} catch (error) {
				expect(error).toBeInstanceOf(DbConnectionError);
				const e = error as DbConnectionError;
				expect(e.name).toBe("DbConnectionError");
				expect(e.payload?.reason).toBe(expectedReason);
			}
		},
	);
});

describe("mapDbError — generic query errors (fallback)", () => {
	it("maps an unknown pg-like error to DbQueryError preserving the code", () => {
		const raw = makePgError("relation does not exist", {
			code: "42P01",
			table: "nonexistent",
		});

		expect(() => mapDbError(raw)).toThrow(DbQueryError);

		try {
			mapDbError(raw);
		} catch (error) {
			expect(error).toBeInstanceOf(DbQueryError);
			const e = error as DbQueryError;
			expect(e.name).toBe("DbQueryError");
			expect(e.message).toBe("relation does not exist");
			expect(e.payload?.code).toBe("42P01");
		}
	});

	it("maps a pg-like error with no code to DbQueryError with undefined code", () => {
		const raw = makePgError("something went wrong", {
			constraint: "some_constraint",
		});

		expect(() => mapDbError(raw)).toThrow(DbQueryError);

		try {
			mapDbError(raw);
		} catch (error) {
			expect(error).toBeInstanceOf(DbQueryError);
			const e = error as DbQueryError;
			expect(e.payload?.code).toBeUndefined();
		}
	});

	it("maps a plain Error (no pg fields) to DbQueryError", () => {
		const raw = new Error("Something unexpected");

		expect(() => mapDbError(raw)).toThrow(DbQueryError);

		try {
			mapDbError(raw);
		} catch (error) {
			expect(error).toBeInstanceOf(DbQueryError);
			const e = error as DbQueryError;
			expect(e.message).toBe("Something unexpected");
			expect(e.payload?.code).toBeUndefined();
		}
	});

	it("maps a non-Error value to DbQueryError with a generic message", () => {
		expect(() => mapDbError("raw string error")).toThrow(DbQueryError);

		try {
			mapDbError(null);
		} catch (error) {
			expect(error).toBeInstanceOf(DbQueryError);
			const e = error as DbQueryError;
			expect(e.message).toBe("Unknown database error");
		}
	});
});
