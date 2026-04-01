import { checkDbConnection } from "@diplom_work/db";
import { s3Healthcheck } from "@diplom_work/file";
import { logger } from "@diplom_work/logger/server";

export async function startupHealthcheck() {
	logger.info("Startup healthcheck started");
	await Promise.all([s3Healthcheck(), checkDbConnection()]);
	logger.info("Startup healthcheck finished");
}
