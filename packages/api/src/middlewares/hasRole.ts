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

		if (ctx.session.session.role !== role) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: `${role} required`,
				cause: `User is not ${role}`,
			});
		}

		return next({
			ctx,
		});
	});
}
