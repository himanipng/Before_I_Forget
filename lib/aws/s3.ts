import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env, hasS3Config } from "@/lib/env";
import { getS3Client } from "./clients";

function safeName(fileName: string) {
  return fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export async function createPresignedUploadUrl(
  fileName: string,
  contentType: string,
): Promise<{ uploadUrl: string; fileKey: string }> {
  const fileKey = `uploads/${Date.now()}-${safeName(fileName || "memory-file")}`;
  const s3Client = getS3Client();

  if (!hasS3Config || !s3Client) {
    return {
      uploadUrl: `https://mock-upload.before-i-forget.local/${fileKey}`,
      fileKey,
    };
  }

  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
    Key: fileKey,
    ContentType: contentType || "application/octet-stream",
  });

  return {
    uploadUrl: await getSignedUrl(s3Client, command, { expiresIn: 900 }),
    fileKey,
  };
}
