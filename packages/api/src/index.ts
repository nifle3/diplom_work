import { db } from "@diplom_work/db";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { Context } from "./context";

export const t = initTRPC.context<Context>().create({
	transformer: superjson,
});

type DomainErrorLike = Error & {
	payload?: unknown;
};

function isDomainError(error: unknown): error is DomainErrorLike {
	return error instanceof Error && "payload" in error;
}

const domainErrorMiddleware = t.middleware(async ({ next }) => {
	try {
		return await next();
	} catch (error) {
		if (error instanceof TRPCError) {
			throw error;
		}

		if (isDomainError(error)) {
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

export const router = t.router;
export const publicProcedure = t.procedure.use(domainErrorMiddleware);

export const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
	if (!ctx.session) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "Authentication required",
			cause: "No session",
		});
	}
	return next({
		ctx: {
			...ctx,
			session: ctx.session,
		},
	});
});

export const adminProcedure = publicProcedure.use(async ({ ctx, next }) => {
	if (!ctx.session) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "Authentication required",
			cause: "No session",
		});
	}

	const user = await db.query.usersTable.findFirst({
		columns: {},
		where: (usersTable, { eq }) =>
			eq(usersTable.id, ctx.session?.user.id ?? ""),
		with: {
			role: true,
		},
	});

	if (!user) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "Authentication required",
			cause: "No session",
		});
	}

	if (user.role.name !== "admin") {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Admin required",
			cause: "User is not admin",
		});
	}

	return next({
		ctx: {
			...ctx,
			session: ctx.session,
		},
	});
});

export const expertProcedure = publicProcedure.use(async ({ ctx, next }) => {
	if (!ctx.session) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "Authentication required",
			cause: "No session",
		});
	}

	const user = await db.query.usersTable.findFirst({
		columns: {},
		where: (usersTable, { eq }) =>
			eq(usersTable.id, ctx.session?.user.id ?? ""),
		with: {
			role: true,
		},
	});

	if (!user) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "Authentication required",
			cause: "No session",
		});
	}

	if (user.role.name !== "expert") {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Admin required",
			cause: "User is not admin",
		});
	}

	return next({
		ctx: {
			...ctx,
			session: ctx.session,
		},
	});
});
