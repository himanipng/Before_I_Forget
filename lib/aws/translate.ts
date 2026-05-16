import { TranslateClient, TranslateTextCommand } from "@aws-sdk/client-translate";

let client: TranslateClient | null = null;

export function getTranslateClient() {
  if (!client) {
    client = new TranslateClient({ region: process.env.AWS_REGION || "us-east-1" });
  }
  return client;
}

export async function translateTextExample(text: string, sourceLanguageCode: string, targetLanguageCode: string) {
  return getTranslateClient().send(
    new TranslateTextCommand({
      Text: text,
      SourceLanguageCode: sourceLanguageCode,
      TargetLanguageCode: targetLanguageCode,
    }),
  );
}
