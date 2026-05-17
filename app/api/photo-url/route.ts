import { NextResponse } from "next/server";
import { createPresignedReadUrl } from "@/lib/aws/s3";
import type { ApiResponse } from "@/lib/types";

export async function GET(request: Request) {
  const fileKey = new URL(request.url).searchParams.get("fileKey") || "";

  if (!fileKey.trim()) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Photo key is required." },
      { status: 400 },
    );
  }

  try {
    const signed = await createPresignedReadUrl(fileKey);
    return NextResponse.json<ApiResponse<typeof signed>>({ success: true, data: signed });
  } catch (error) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: error instanceof Error ? error.message : "Unable to load photo." },
      { status: 500 },
    );
  }
}
