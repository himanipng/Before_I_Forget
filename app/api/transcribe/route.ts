import { NextResponse } from "next/server";
import { simulateTranscript } from "@/lib/mockAI";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const transcript = simulateTranscript(body.fileName || body.fakeFileName);
  return NextResponse.json({
    transcript,
    provider: "mock-transcribe",
    awsReady: "Amazon Transcribe job can be started from lib/aws/transcribe.ts",
  });
}
