import {
	errorMiddleware,
	hasRoleMiddleware,
	loggerMiddleware,
	protectedMiddleware,
} from "../middlewares";
import { t } from "./trpc";

export const router = t.router;

export const publicProcedure = t.procedure
	.use(errorMiddleware)
	.use(loggerMiddleware);

export const protectedProcedure = publicProcedure.use(protectedMiddleware);
export const adminProcedure = publicProcedure.use(hasRoleMiddleware("admin"));
export const expertProcedure = publicProcedure.use(hasRoleMiddleware("expert"));
