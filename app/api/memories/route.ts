import { NextResponse } from "next/server";
import { listMemories } from "@/lib/storage";
import type { ApiResponse, MemoryCard } from "@/lib/types";

export async function GET() {
  try {
    const memories = await listMemories();
    return NextResponse.json<ApiResponse<MemoryCard[]>>({ success: true, data: memories });
  } catch (error) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: error instanceof Error ? error.message : "Unable to list memories." },
      { status: 500 },
    );
  }
}
