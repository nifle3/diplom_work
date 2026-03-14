import { PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@diplom_work/env/server";
import { client } from "./storage";
import { generateFileKey } from "./utils";

type UploadFileParams = {
	fileBuffer: Buffer;
	originalName: string;
	contentType: string;
	folder?: string;
};

export async function uploadFile({
	fileBuffer,
	originalName,
	contentType,
	folder = "uploads",
}: UploadFileParams): Promise<string> {
	const key = generateFileKey(originalName, folder);

	await client.send(
		new PutObjectCommand({
			Bucket: env.S3_BUCKET,
			Key: key,
			Body: fileBuffer,
			ContentType: contentType,
		}),
	);

	return key;
}
