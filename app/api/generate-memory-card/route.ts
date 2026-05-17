import { NextResponse } from "next/server";
import { generateMemoryCardWithBedrock } from "@/lib/aws/bedrock";
import type { GenerateMemoryCardInput } from "@/lib/types";

export async function POST(request: Request) {
  const input = (await request.json()) as GenerateMemoryCardInput;
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
