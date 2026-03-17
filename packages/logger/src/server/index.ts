import { env } from "@diplom_work/env/server";
import pino from "pino";
import pretty from "pino-pretty";

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
	},
	stream,
);

export type Logger = pino.Logger;
