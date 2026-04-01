import { AsyncLocalStorage } from "node:async_hooks";
import { env } from "@diplom_work/env/server";
import pino from "pino";
import pretty from "pino-pretty";

export type LoggerContext = {
	requestId: string;
	userId?: string;
	clientIp?: string | null;
	userAgent?: string | null;
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
			if (!reqId) {
				return {};
			}

			const context = loggerStore.getStore();

			return {
				requestId: reqId,
				...(context?.userId ? { userId: context.userId } : {}),
				...(context?.clientIp ? { clientIp: context.clientIp } : {}),
				...(context?.userAgent ? { userAgent: context.userAgent } : {}),
			};
		},
	},
	stream,
);

export type Logger = pino.Logger;
