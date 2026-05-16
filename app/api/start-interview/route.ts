import { NextResponse } from "next/server";
import { generateInterviewQuestions } from "@/lib/mockAI";
import type { StartInterviewInput } from "@/lib/types";

export async function POST(request: Request) {
  const input = (await request.json()) as StartInterviewInput;
  return NextResponse.json({ questions: generateInterviewQuestions(input) });
}
