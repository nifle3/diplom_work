import { AsyncLocalStorage } from "node:async_hooks";
import { env } from "@diplom_work/env/server";
import pino from "pino";
import pretty from "pino-pretty";

export type LoggerContext = {
	requestId: string;
};

const STORE_SYMBOL = Symbol.for("diplom_work_logger_store");

const globalForLogger = globalThis as unknown as {
	[STORE_SYMBOL]: AsyncLocalStorage<LoggerContext> | undefined;
};

export const loggerStore =
	globalForLogger[STORE_SYMBOL] ?? new AsyncLocalStorage<LoggerContext>();

if (env.NODE_ENV !== "production") {
	globalForLogger[STORE_SYMBOL] = loggerStore;
}

const getRequestId = () => loggerStore.getStore()?.requestId;

const stream =
	env.NODE_ENV !== "production"
		? pretty({
				colorize: true,
				translateTime: "SYS:standard",
				ignore: "pid,hostname",
			})
		: undefined;

export const logger = pino(
	{
		level: env.NODE_ENV === "production" ? "info" : "debug",

		mixin() {
			const reqId = getRequestId();
			console.log("👉 3. Запрос лога (mixin), ID:", reqId); // ПРОВЕРКА 3
			if (reqId) {
				return { requestId: reqId };
			}
			return {};
		},
	},
	stream,
);

export type Logger = pino.Logger;
