import { loggerStore } from "@diplom_work/logger/server";
import { t } from "../init/trpc";

export const requestIdLoggerMiddleware = t.middleware(async ({ ctx, next }) => {
	return loggerStore.run(
		{
			requestId: ctx.requestId,
			userId: ctx.session?.user.id,
			clientIp: ctx.clientIp,
			userAgent: ctx.userAgent,
		},
		async () => {
			return await next();
		},
	);
});
