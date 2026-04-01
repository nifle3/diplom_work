import { ListBucketsCommand } from "@aws-sdk/client-s3";
import { logger } from "@diplom_work/logger/server";
import { client } from "./storage";

export async function s3Healthcheck() {
	try {
		await client.send(new ListBucketsCommand({}));
		logger.info("S3 connection established");
	} catch (error: unknown) {
		if (error instanceof Error) {
			logger.error({ error }, "S3 connection failed");
			throw new Error(
				`S3 Connection failed: ${error.name} with message ${error.message} with cause: ${error.cause}`,
			);
		}

		logger.error({ error }, "S3 connection failed");
		throw new Error("S3 Connection failed: unavaible error");
	}
}
