import { db } from "@diplom_work/db";
import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";

export const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
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

export const adminProcedure = t.procedure.use(async ({ ctx, next }) => {
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

export const expertProcedure = t.procedure.use(async ({ ctx, next }) => {
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
