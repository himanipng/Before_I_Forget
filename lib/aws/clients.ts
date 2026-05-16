import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { SFNClient } from "@aws-sdk/client-sfn";
import { TranscribeClient } from "@aws-sdk/client-transcribe";
import { TranslateClient } from "@aws-sdk/client-translate";
import { env, hasAwsConfig } from "@/lib/env";

type AwsCredentials = {
  accessKeyId: string;
  secretAccessKey: string;
};

function credentials(): AwsCredentials {
  return {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  };
}

let dynamoClient: DynamoDBClient | null = null;
let dynamoDocumentClient: DynamoDBDocumentClient | null = null;
let s3Client: S3Client | null = null;
let sfnClient: SFNClient | null = null;
let transcribeClient: TranscribeClient | null = null;
let translateClient: TranslateClient | null = null;

export function getDynamoDBClient() {
  if (!hasAwsConfig) return null;
  if (!dynamoClient) {
    dynamoClient = new DynamoDBClient({ region: env.AWS_REGION, credentials: credentials() });
  }
  return dynamoClient;
}

export function getDynamoDBDocumentClient() {
  if (!hasAwsConfig) return null;
  if (!dynamoDocumentClient) {
    const client = getDynamoDBClient();
    dynamoDocumentClient = client ? DynamoDBDocumentClient.from(client) : null;
  }
  return dynamoDocumentClient;
}

export function getS3Client() {
  if (!hasAwsConfig) return null;
  if (!s3Client) {
    s3Client = new S3Client({ region: env.AWS_REGION, credentials: credentials() });
  }
  return s3Client;
}

export function getSFNClient() {
  if (!hasAwsConfig) return null;
  if (!sfnClient) {
    sfnClient = new SFNClient({ region: env.AWS_REGION, credentials: credentials() });
  }
  return sfnClient;
}

export function getTranscribeClient() {
  if (!hasAwsConfig) return null;
  if (!transcribeClient) {
    transcribeClient = new TranscribeClient({ region: env.AWS_REGION, credentials: credentials() });
  }
  return transcribeClient;
}

export function getTranslateClient() {
  if (!hasAwsConfig) return null;
  if (!translateClient) {
    translateClient = new TranslateClient({ region: env.AWS_REGION, credentials: credentials() });
  }
  return translateClient;
}
