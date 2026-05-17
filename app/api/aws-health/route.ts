import { NextResponse } from "next/server";
import {
  env,
  hasAwsConfig,
  hasBedrockConfig,
  hasS3Config,
  hasStepFunctionConfig,
  hasTranscribeConfig,
  hasTranslateConfig,
} from "@/lib/env";

function present(value: string) {
  return Boolean(value && value.trim());
}

export async function GET() {
  return NextResponse.json({
    region: env.AWS_REGION,
    hasAwsConfig,
    hasS3Config,
    hasStepFunctionConfig,
    hasBedrockConfig,
    hasTranscribeConfig,
    hasTranslateConfig,
    env: {
      AWS_REGION: present(env.AWS_REGION),
      AWS_ACCESS_KEY_ID: present(env.AWS_ACCESS_KEY_ID),
      AWS_SECRET_ACCESS_KEY: present(env.AWS_SECRET_ACCESS_KEY),
      S3_BUCKET_NAME: present(env.S3_BUCKET_NAME),
      DYNAMODB_TABLE_NAME: present(env.DYNAMODB_TABLE_NAME),
      STEP_FUNCTION_ARN: present(env.STEP_FUNCTION_ARN),
      BEDROCK_MODEL_ID: present(env.BEDROCK_MODEL_ID),
      TRANSCRIBE_LANGUAGE_CODE: present(env.TRANSCRIBE_LANGUAGE_CODE),
      POLLY_VOICE_ID: present(env.POLLY_VOICE_ID),
    },
  });
}
