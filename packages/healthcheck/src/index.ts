import { checkDbConnection } from "@diplom_work/db";
import { s3Healthcheck } from "@diplom_work/file";

export async function startupHealthcheck() {
	await Promise.all([s3Healthcheck(), checkDbConnection()]);
}
