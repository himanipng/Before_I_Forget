import { NextResponse } from "next/server";
import { getProfile, saveProfile } from "@/lib/profileStorage";
import type { ApiResponse, PersonProfile } from "@/lib/types";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: Context) {
  const { id } = await context.params;
  const profile = await getProfile(id);

  if (!profile) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Profile not found." },
      { status: 404 },
    );
  }

  return NextResponse.json<ApiResponse<PersonProfile>>({ success: true, data: profile });
}

export async function PATCH(request: Request, context: Context) {
  const { id } = await context.params;
  const current = await getProfile(id);

  if (!current) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Profile not found." },
      { status: 404 },
    );
  }

  const body = await request.json();
  const profile = await saveProfile({ ...current, ...body, profileId: current.profileId });
  return NextResponse.json<ApiResponse<PersonProfile>>({ success: true, data: profile });
}
