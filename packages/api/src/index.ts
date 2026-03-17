import { db } from "@diplom_work/db";
import { logger } from "@diplom_work/logger/server";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { Context } from "./context";
import { domainErrorMiddleware } from "./middlewares";

export const t = initTRPC.context<Context>().create({
	transformer: superjson,
});

const errorMiddleware = t.middleware(domainErrorMiddleware);
const loggerMiddleware = t.middleware(async ({ path, type, next }) => {
	const start = Date.now();
	const result = await next();
	const durationMs = Date.now() - start;

	if (result.ok) {
		logger.info({ path, type, durationMs }, `[tRPC] ${path} success`);
	} else {
		logger.error(
			{ path, type, durationMs, error: result.error },
			`[tRPC] ${path} error`,
		);
	}

	return result;
});

export const router = t.router;
export const publicProcedure = t.procedure
	.use(errorMiddleware)
	.use(loggerMiddleware);

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
