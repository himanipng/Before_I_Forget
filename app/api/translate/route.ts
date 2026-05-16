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

  let awsResponse;

  try {
    awsResponse = await translateText(safeText, sourceLanguage || "auto", safeTarget);
  } catch (error) {
    return NextResponse.json({
      translatedText: mockTranslate(safeText, safeTarget),
      sourceLanguage: sourceLanguage || "auto",
      targetLanguage: safeTarget,
      provider: "mock-translate",
      warning: error instanceof Error ? error.message : "AWS Translate was unavailable, so the demo used mock translation.",
    });
  }

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
