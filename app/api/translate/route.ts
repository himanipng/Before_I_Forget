import { NextResponse } from "next/server";
import { mockTranslate } from "@/lib/mockAI";
// import { translateTextExample } from "@/lib/aws/translate";

export async function POST(request: Request) {
  const { text, targetLanguage, sourceLanguage } = await request.json();

  // To enable AWS Translate later:
  // const response = await translateTextExample(text, sourceLanguage || "auto", targetLanguageCode);
  // return NextResponse.json({ translatedText: response.TranslatedText });

  return NextResponse.json({
    translatedText: mockTranslate(text || "", targetLanguage || "Hindi"),
    sourceLanguage: sourceLanguage || "auto",
    targetLanguage: targetLanguage || "Hindi",
  });
}
