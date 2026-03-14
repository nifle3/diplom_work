import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@diplom_work/env/server";
import { client } from "./storage";

export async function getPersistentLink(key: string): Promise<string> {
	const command = new GetObjectCommand({
		Bucket: env.S3_BUCKET,
		Key: key,
	});

	return await getSignedUrl(client, command, {
		expiresIn: 60 * 15,
	});
}
