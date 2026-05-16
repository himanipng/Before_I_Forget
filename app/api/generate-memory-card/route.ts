import { NextResponse } from "next/server";
import { generateMemoryCard } from "@/lib/mockAI";
import type { GenerateMemoryCardInput } from "@/lib/types";

export async function POST(request: Request) {
  const input = (await request.json()) as GenerateMemoryCardInput;
  const generated = generateMemoryCard(input);
  return NextResponse.json({
    id: crypto.randomUUID(),
    ...generated,
    createdAt: new Date().toISOString(),
  });
}
