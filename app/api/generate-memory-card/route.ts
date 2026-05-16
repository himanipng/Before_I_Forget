import { NextResponse } from "next/server";
import { generateMemoryCard } from "@/lib/mockAI";
import type { GenerateMemoryCardInput } from "@/lib/types";

export async function POST(request: Request) {
  const input = (await request.json()) as GenerateMemoryCardInput;
  const generated = generateMemoryCard(input);
  const memoryId = crypto.randomUUID();
  return NextResponse.json({
    id: memoryId,
    memoryId,
    ...generated,
    createdAt: new Date().toISOString(),
    status: "MOCK",
  });
}
