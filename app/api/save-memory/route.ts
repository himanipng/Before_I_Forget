import { NextResponse } from "next/server";
import { saveMemory } from "@/lib/storage";
import type { ApiResponse, MemoryCard } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const memory = (await request.json()) as MemoryCard;

    if (!memory.memoryId || !memory.title || !memory.personName) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: "Memory card is missing required fields." },
        { status: 400 },
      );
    }

    const saved = await saveMemory(memory);
    return NextResponse.json<ApiResponse<MemoryCard>>({ success: true, data: saved });
  } catch (error) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: error instanceof Error ? error.message : "Unable to save memory." },
      { status: 500 },
    );
  }
}
