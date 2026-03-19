import { loggerStore } from "@diplom_work/logger/server";
import { t } from "../init/trpc";

export const requestIdLoggerMiddleware = t.middleware(async ({ ctx, next }) => {
	return loggerStore.run({ requestId: ctx.requestId }, async () => {
		return await next();
	});
});
