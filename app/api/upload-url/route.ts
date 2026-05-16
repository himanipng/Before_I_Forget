import { NextResponse } from "next/server";
import { createPresignedUploadUrl } from "@/lib/aws/s3";
import type { ApiResponse } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const { fileName, contentType } = await request.json();

    if (!String(fileName || "").trim()) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: "Please provide a file name." },
        { status: 400 },
      );
    }

    const upload = await createPresignedUploadUrl(fileName, contentType || "application/octet-stream");
    return NextResponse.json<ApiResponse<typeof upload>>({ success: true, data: upload });
  } catch (error) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: error instanceof Error ? error.message : "Unable to create upload URL." },
      { status: 500 },
    );
  }
}
