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

const baseProcedure = t.procedure
	.use(requestIdLoggerMiddleware)
	.use(errorMiddleware)
	.use(loggerMiddleware);

export const publicProcedure = baseProcedure.use(globalRateLimitMiddleware);
export const protectedProcedure = publicProcedure.use(protectedMiddleware);
export const adminProcedure = protectedProcedure.use(hasRoleMiddleware("admin"));
export const expertProcedure = protectedProcedure.use(hasRoleMiddleware("expert"));

export const llmProcedure = baseProcedure
	.use(protectedMiddleware)
	.use(llmRateLimitMiddleware);
