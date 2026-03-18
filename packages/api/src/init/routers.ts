import {
	errorMiddleware,
	loggerMiddleware,
	protectedMiddleware,
} from "../middlewares";
import { hasRoleMiddleware } from "../middlewares/hasrole";
import { t } from "./trpc";

export const router = t.router;

export const publicProcedure = t.procedure
	.use(errorMiddleware)
	.use(loggerMiddleware);

export const protectedProcedure = publicProcedure.use(protectedMiddleware);
export const adminProcedure = publicProcedure.use(hasRoleMiddleware("admin"));
export const expertProcedure = publicProcedure.use(hasRoleMiddleware("expert"));
