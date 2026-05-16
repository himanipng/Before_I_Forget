import { NextResponse } from "next/server";
// import { synthesizeSpeechExample } from "@/lib/aws/polly";

export async function POST(request: Request) {
  const { gratitudeLetter, voice } = await request.json();

  // To enable AWS Polly later:
  // const speech = await synthesizeSpeechExample(gratitudeLetter, voice);
  // Upload the returned audio stream to S3, then return the signed S3 URL.

  return NextResponse.json({
    audioUrl: `/audio/mock-letter-${encodeURIComponent(voice || "warm-voice")}.mp3`,
    duration: Math.max(18, Math.ceil((gratitudeLetter || "").length / 18)),
    provider: "mock-polly",
  });
}
