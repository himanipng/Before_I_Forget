import { NextResponse } from "next/server";
import { generateInterviewQuestions } from "@/lib/mockAI";
import type { StartInterviewInput } from "@/lib/types";

export async function POST(request: Request) {
  const input = (await request.json()) as StartInterviewInput;
  const missing = ["relationship", "country", "language", "memoryType", "goal"].filter(
    (key) => !String(input[key as keyof StartInterviewInput] || "").trim(),
  );

  if (missing.length) {
    return NextResponse.json({ error: `Missing required fields: ${missing.join(", ")}` }, { status: 400 });
  }

  return NextResponse.json({
    questions: generateInterviewQuestions(input),
    provider: "mock-ai-bedrock-ready",
  });
}
