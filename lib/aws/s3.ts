import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

let client: S3Client | null = null;

export function getS3Client() {
  if (!client) {
    client = new S3Client({ region: process.env.AWS_REGION || "us-east-1" });
  }
  return client;
}

export async function uploadMemoryFileMockReady(key: string, body: Uint8Array | string) {
  if (!process.env.S3_BUCKET_NAME) {
    return { bucket: "mock-before-i-forget", key, mocked: true };
  }

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: body,
    }),
  );

  return { bucket: process.env.S3_BUCKET_NAME, key, mocked: false };
}
