import {
	errorMiddleware,
	globalRateLimitMiddleware,
	hasRoleMiddleware,
	llmRateLimitMiddleware,
	loggerMiddleware,
	protectedMiddleware,
	requestIdLoggerMiddleware,
} from "../middlewares";
import { t } from "./trpc";

export const router = t.router;

export const publicProcedure = t.procedure
	.use(requestIdLoggerMiddleware)
	.use(errorMiddleware)
	.use(globalRateLimitMiddleware)
	.use(loggerMiddleware);

export const protectedProcedure = publicProcedure.use(protectedMiddleware);
export const adminProcedure = publicProcedure.use(hasRoleMiddleware("admin"));
export const expertProcedure = publicProcedure.use(hasRoleMiddleware("expert"));
export const llmProcedure = protectedProcedure.use(llmRateLimitMiddleware);
