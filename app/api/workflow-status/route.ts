import { NextResponse } from "next/server";
import { getWorkflowStatus } from "@/lib/aws/stepFunctions";
import type { ApiResponse } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const executionArn = new URL(request.url).searchParams.get("executionArn") || undefined;
    const status = await getWorkflowStatus(executionArn);
    return NextResponse.json<ApiResponse<typeof status>>({ success: true, data: status });
  } catch (error) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: error instanceof Error ? error.message : "Unable to read workflow status." },
      { status: 500 },
    );
  }
}
