import { NextResponse } from "next/server";
import { listMemories } from "@/lib/storage";

export async function GET() {
  const memories = await listMemories();
  return NextResponse.json({ memories });
}
