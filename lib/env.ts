const serverEnv = {
  AWS_REGION: process.env.AWS_REGION || "us-west-2",
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || "",
  DYNAMODB_TABLE_NAME: process.env.DYNAMODB_TABLE_NAME || "",
  STEP_FUNCTION_ARN: process.env.STEP_FUNCTION_ARN || "",
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "",
};

export const hasAwsConfig = Boolean(
  serverEnv.AWS_REGION &&
    serverEnv.AWS_ACCESS_KEY_ID &&
    serverEnv.AWS_SECRET_ACCESS_KEY &&
    serverEnv.DYNAMODB_TABLE_NAME,
);

export const hasS3Config = hasAwsConfig && Boolean(serverEnv.S3_BUCKET_NAME);
export const hasStepFunctionConfig = hasAwsConfig && Boolean(serverEnv.STEP_FUNCTION_ARN);

export const env = serverEnv;

export function assertAwsConfig() {
  if (!hasAwsConfig) {
    throw new Error("AWS config missing, using mock mode.");
  }
}
