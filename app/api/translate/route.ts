import { NextResponse } from "next/server";
import { mockTranslate } from "@/lib/mockAI";
import { translateText } from "@/lib/aws/translate";

export async function POST(request: Request) {
  const { text, targetLanguage, sourceLanguage } = await request.json();
  const safeText = String(text || "").trim();
  const safeTarget = targetLanguage || "English";

  if (!safeText) {
    return NextResponse.json({ translatedText: "", sourceLanguage: sourceLanguage || "auto", targetLanguage: safeTarget });
  }

  const awsResponse = await translateText(safeText, sourceLanguage || "auto", safeTarget);

  if (awsResponse?.TranslatedText) {
    return NextResponse.json({
      translatedText: awsResponse.TranslatedText,
      sourceLanguage: awsResponse.SourceLanguageCode || sourceLanguage || "auto",
      targetLanguage: awsResponse.TargetLanguageCode || safeTarget,
      provider: "aws-translate",
    });
  }

  return NextResponse.json({
    translatedText: mockTranslate(safeText, safeTarget),
    sourceLanguage: sourceLanguage || "auto",
    targetLanguage: safeTarget,
    provider: "mock-translate",
  });
}
