import { StartTranscriptionJobCommand, TranscribeClient, type LanguageCode } from "@aws-sdk/client-transcribe";

let client: TranscribeClient | null = null;

export function getTranscribeClient() {
  if (!client) {
    client = new TranscribeClient({ region: process.env.AWS_REGION || "us-east-1" });
  }
  return client;
}

export async function startTranscriptionJobExample(jobName: string, mediaUri: string) {
  return getTranscribeClient().send(
    new StartTranscriptionJobCommand({
      TranscriptionJobName: jobName,
      LanguageCode: (process.env.TRANSCRIBE_LANGUAGE_CODE || "en-US") as LanguageCode,
      Media: { MediaFileUri: mediaUri },
    }),
  );
}
