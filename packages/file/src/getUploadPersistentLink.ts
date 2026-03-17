import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@diplom_work/env/server";
import { client } from "./storage";

export async function getUploadPersistentLink(
	key: string,
	contentType: string,
): Promise<string> {
	const command = new PutObjectCommand({
		Bucket: env.S3_BUCKET,
		Key: key,
		ContentType: contentType,
	});

	const url = await getSignedUrl(client, command, { expiresIn: 60 });
	return url;
}
