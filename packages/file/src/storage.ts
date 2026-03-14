import { S3Client } from "@aws-sdk/client-s3";
import { env } from "@diplom_work/env/server";

export const client = new S3Client({
	region: env.S3_REGION,
	endpoint: env.S3_ENDPOINT,
	forcePathStyle: true,
	credentials: {
		accessKeyId: `${env.S3_KEY_ID}:${env.S3_KEY_ID}`,
		secretAccessKey: env.S3_SECRET_KEY,
	},
});
