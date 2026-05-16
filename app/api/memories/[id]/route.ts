import { NextResponse } from "next/server";
import { getMemory } from "@/lib/storage";
import type { ApiResponse, MemoryCard } from "@/lib/types";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const memory = await getMemory(id);

    if (!memory) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: "Memory not found." },
        { status: 404 },
      );
    }

    return NextResponse.json<ApiResponse<MemoryCard>>({ success: true, data: memory });
  } catch (error) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: error instanceof Error ? error.message : "Unable to load memory." },
      { status: 500 },
    );
  }
}
