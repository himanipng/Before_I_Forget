import {
  GetTranscriptionJobCommand,
  StartTranscriptionJobCommand,
  type LanguageCode,
  type MediaFormat,
} from "@aws-sdk/client-transcribe";
import { env, hasTranscribeConfig } from "@/lib/env";
import { getTranscribeClient } from "./clients";

const languageCodeByName: Record<string, LanguageCode> = {
  English: "en-US",
  Hindi: "hi-IN",
  Spanish: "es-US",
  Mandarin: "zh-CN",
  Arabic: "ar-SA",
  Tagalog: "tl-PH",
  Vietnamese: "vi-VN",
  French: "fr-FR",
};

const likelyLanguages: LanguageCode[] = ["en-US", "hi-IN", "es-US", "zh-CN", "ar-SA", "tl-PH", "vi-VN", "fr-FR"];

function safeJobName(input: string) {
  return input
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}

function inferMediaFormat(fileName = ""): MediaFormat | undefined {
  const extension = fileName.toLowerCase().split(".").pop();
  if (extension === "mp3" || extension === "mp4" || extension === "wav" || extension === "flac" || extension === "ogg" || extension === "webm") {
    return extension;
  }
  if (extension === "m4a") return "mp4";
  return undefined;
}

export function s3UriForKey(fileKey: string) {
  return `s3://${env.S3_BUCKET_NAME}/${fileKey}`;
}

export async function startMemoryTranscriptionJob({
  fileName,
  fileKey,
  mediaUri,
  language,
  identifyLanguage = true,
}: {
  fileName?: string;
  fileKey?: string;
  mediaUri?: string;
  language?: string;
  identifyLanguage?: boolean;
}) {
  const transcribeClient = getTranscribeClient();

  if (!hasTranscribeConfig || !transcribeClient) {
    return null;
  }

  const jobName = safeJobName(`before-i-forget-${Date.now()}-${fileName || fileKey || "recording"}`);
  const knownLanguage = language ? languageCodeByName[language] : undefined;

  const command = new StartTranscriptionJobCommand({
    TranscriptionJobName: jobName,
    Media: { MediaFileUri: mediaUri || (fileKey ? s3UriForKey(fileKey) : undefined) },
    MediaFormat: inferMediaFormat(fileName || fileKey),
    OutputBucketName: env.S3_BUCKET_NAME,
    OutputKey: `transcripts/${jobName}.json`,
    ...(identifyLanguage
      ? { IdentifyLanguage: true, LanguageOptions: likelyLanguages }
      : { LanguageCode: knownLanguage || ((env.TRANSCRIBE_LANGUAGE_CODE || "en-US") as LanguageCode) }),
  });

  const response = await transcribeClient.send(command);

  return {
    jobName,
    status: response.TranscriptionJob?.TranscriptionJobStatus || "IN_PROGRESS",
    mediaUri: mediaUri || (fileKey ? s3UriForKey(fileKey) : undefined),
    outputKey: `transcripts/${jobName}.json`,
  };
}

export async function getMemoryTranscriptionJob(jobName: string) {
  const transcribeClient = getTranscribeClient();

  if (!hasTranscribeConfig || !transcribeClient) {
    return null;
  }

  const response = await transcribeClient.send(new GetTranscriptionJobCommand({ TranscriptionJobName: jobName }));
  const job = response.TranscriptionJob;

  return {
    jobName,
    status: job?.TranscriptionJobStatus,
    transcriptUri: job?.Transcript?.TranscriptFileUri,
    failureReason: job?.FailureReason,
    languageCode: job?.LanguageCode,
  };
}
