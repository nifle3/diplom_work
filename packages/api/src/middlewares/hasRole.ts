import { db } from "@diplom_work/db";
import { TRPCError } from "@trpc/server";
import { t } from "../init/trpc";

export function hasRoleMiddleware(role: "expert" | "admin") {
	return t.middleware(async ({ ctx, next }) => {
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

		if (user.role.name !== role) {
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
}
