import { env } from "@diplom_work/env/server";
import { globalRateLimit, llmRateLimit } from "@diplom_work/ratelimit";
import { TRPCError } from "@trpc/server";
import type { Context } from "../init/context";
import { t } from "../init/trpc";

function buildRateLimitIdentifier(ctx: Context, path: string) {
	if (ctx.session?.user.id) {
		return `user:${ctx.session.user.id}:${path}`;
	}

	if (ctx.clientIp) {
		return `ip:${ctx.clientIp}:${path}`;
	}

	if (ctx.userAgent) {
		return `ua:${ctx.userAgent}:${path}`;
	}

	return `anonymous:${path}`;
}

function createRateLimitMiddleware(
	limit: { limit: (identifier: string) => Promise<{ success: boolean }> },
	message: string,
) {
	return t.middleware(async ({ ctx, path, next }) => {
		if (!env.RATE_LIMIT_ENABLE) {
			return next();
		}

		const identifier = buildRateLimitIdentifier(ctx, path);
		const result = await limit.limit(identifier);

		if (!result.success) {
			throw new TRPCError({
				code: "TOO_MANY_REQUESTS",
				message,
			});
		}

		return next();
	});
}

export const globalRateLimitMiddleware = createRateLimitMiddleware(
	globalRateLimit,
	"Too many requests. Please try again a little later.",
);

export const llmRateLimitMiddleware = createRateLimitMiddleware(
	llmRateLimit,
	"LLM rate limit exceeded. Please wait a minute and try again.",
);
