import { NextResponse } from "next/server";
import { startMemoryWorkflow } from "@/lib/aws/stepFunctions";
import { saveMemory } from "@/lib/storage";
import type { ApiResponse, MemoryInput } from "@/lib/types";

function validateMemoryInput(input: Partial<MemoryInput>) {
  const required: Array<keyof MemoryInput> = [
    "personName",
    "relationship",
    "country",
    "language",
    "memoryType",
    "storyText",
  ];
  const missing = required.filter((key) => !String(input[key] || "").trim());
  return missing.length ? `Missing required fields: ${missing.join(", ")}` : null;
}

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as MemoryInput;
    const validationError = validateMemoryInput(input);

    if (validationError) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: validationError },
        { status: 400 },
      );
    }

    const result = await startMemoryWorkflow(input);

    if (result.mock && result.memoryCard) {
      result.memoryCard = await saveMemory(result.memoryCard);
    }

    return NextResponse.json<ApiResponse<typeof result>>({ success: true, data: result });
  } catch (error) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: error instanceof Error ? error.message : "Unable to start memory workflow." },
      { status: 500 },
    );
  }
}
