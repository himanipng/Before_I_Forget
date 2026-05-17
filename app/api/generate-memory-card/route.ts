import { NextResponse } from "next/server";
import { generateMemoryCardWithBedrock } from "@/lib/aws/bedrock";
import type { GenerateMemoryCardInput } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const input = normalizeInput(body);
  const generated = await generateMemoryCardWithBedrock(input);
  const memoryId = crypto.randomUUID();

  return NextResponse.json({
    id: memoryId,
    memoryId,
    ...generated.data,
    createdAt: new Date().toISOString(),
    status: generated.provider === "bedrock-claude" ? "SUCCEEDED" : "MOCK",
    provider: generated.provider,
    warning: generated.warning,
  });
}

function normalizeInput(value: unknown): GenerateMemoryCardInput {
  const body = typeof value === "object" && value ? (value as Record<string, unknown>) : {};
  const answers = Array.isArray(body.answers)
    ? body.answers.map((answer) => String(answer || "")).filter(Boolean)
    : [String(body.storyText || "")].filter(Boolean);

  return {
    personName: String(body.personName || "Nani"),
    relationship: String(body.relationship || "grandparent") as GenerateMemoryCardInput["relationship"],
    country: String(body.country || "India"),
    language: String(body.language || "English") as GenerateMemoryCardInput["language"],
    memoryType: String(body.memoryType || "recipe") as GenerateMemoryCardInput["memoryType"],
    answers,
  };
}
