import { NextResponse } from "next/server";
import { saveMemory } from "@/lib/storage";
import type { MemoryCardData } from "@/lib/types";

export async function POST(request: Request) {
  const memory = (await request.json()) as MemoryCardData;
  const saved = await saveMemory({
    ...memory,
    id: memory.id || crypto.randomUUID(),
    createdAt: memory.createdAt || new Date().toISOString(),
  });
  return NextResponse.json({ memory: saved });
}
