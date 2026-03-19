import { HeadBucketCommand } from "@aws-sdk/client-s3";
import { client } from "./storage";

export async function s3Healthcheck() {
    try {
    await client.send(new HeadBucketCommand({ Bucket: process.env.AWS_BUCKET_NAME }));
    console.log('✅ S3 connection established');
  } catch (error: unknown) {
    if (error instanceof Error) {
        throw new Error(`S3 Connection failed: ${error.name} with message ${error.message} with cause: ${error.cause}`);
    }

    throw new Error("S3 Connection failed: unavaible error");
  }
}