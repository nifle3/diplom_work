import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@diplom_work/env/server";
import { client } from "./storage";

export async function deleteFile(key: string): Promise<void> {
	await client.send(
		new DeleteObjectCommand({
			Bucket: env.S3_BUCKET,
			Key: key,
		}),
	);
}
