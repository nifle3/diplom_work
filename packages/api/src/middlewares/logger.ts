import { logger } from "@diplom_work/logger/server";
import { t } from "../init/trpc";

export const loggerMiddleware = t.middleware(async ({ path, type, next }) => {
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
