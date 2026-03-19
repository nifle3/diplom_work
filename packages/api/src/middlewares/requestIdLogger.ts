import { t } from "../init/trpc";
import { loggerStore } from "@diplom_work/logger/server";

export const requestIdLoggerMiddleware = t.middleware(async ({ ctx, next }) => {
	console.log("👉 1. Запускаем ALS с ID:", ctx.requestId); // ПРОВЕРКА 1
	return loggerStore.run({ requestId: ctx.requestId }, async () => {
		console.log("👉 2. Внутри ALS (до next):", loggerStore.getStore()?.requestId); // ПРОВЕРКА 2
		return await next(); 
	});
});