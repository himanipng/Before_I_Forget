import { TranslateClient, TranslateTextCommand } from "@aws-sdk/client-translate";
import { hasTranslateConfig } from "@/lib/env";
import { getTranslateClient as getSharedTranslateClient } from "./clients";

const languageCodeByName: Record<string, string> = {
  English: "en",
  Hindi: "hi",
  Spanish: "es",
  Mandarin: "zh",
  Arabic: "ar",
  Tagalog: "tl",
  Vietnamese: "vi",
  French: "fr",
  other: "en",
};

export function normalizeTranslateLanguage(language?: string, fallback = "en") {
  if (!language) return fallback;
  return languageCodeByName[language] || language.toLowerCase().slice(0, 5) || fallback;
}

export function getTranslateClient(): TranslateClient | null {
  return getSharedTranslateClient();
}

export async function translateText(text: string, sourceLanguageCode?: string, targetLanguageCode?: string) {
  const translateClient = getTranslateClient();

  if (!hasTranslateConfig || !translateClient) {
    return null;
  }

  return translateClient.send(
    new TranslateTextCommand({
      Text: text,
      SourceLanguageCode: normalizeTranslateLanguage(sourceLanguageCode, "auto"),
      TargetLanguageCode: normalizeTranslateLanguage(targetLanguageCode, "en"),
    }),
  );
}

export const translateTextExample = translateText;
