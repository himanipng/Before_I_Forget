import { NextResponse } from "next/server";
import { listProfiles, saveProfile } from "@/lib/profileStorage";
import type { ApiResponse, PersonProfile } from "@/lib/types";

export async function GET() {
  try {
    const profiles = await listProfiles();
    return NextResponse.json<ApiResponse<PersonProfile[]>>({ success: true, data: profiles });
  } catch (error) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: error instanceof Error ? error.message : "Unable to list profiles." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!String(body.personName || "").trim()) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: "Person name is required." },
        { status: 400 },
      );
    }

    const profile = await saveProfile(body);
    return NextResponse.json<ApiResponse<PersonProfile>>({ success: true, data: profile });
  } catch (error) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: error instanceof Error ? error.message : "Unable to save profile." },
      { status: 500 },
    );
  }
}
