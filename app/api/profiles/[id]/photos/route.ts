import { NextResponse } from "next/server";
import { addProfilePhoto } from "@/lib/profileStorage";
import type { ApiResponse, PersonPhoto, PersonProfile } from "@/lib/types";

type Context = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: Context) {
  const { id } = await context.params;
  const body = await request.json();
  const now = new Date().toISOString();
  const photo: PersonPhoto = {
    id: body.id || `photo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    fileName: String(body.fileName || "memory photo"),
    fileKey: String(body.fileKey || ""),
    contentType: String(body.contentType || "image/jpeg"),
    uploadedAt: body.uploadedAt || now,
    caption: String(body.caption || ""),
  };

  if (!photo.fileKey.trim()) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Photo file key is required." },
      { status: 400 },
    );
  }

  const profile = await addProfilePhoto(id, photo);
  return NextResponse.json<ApiResponse<PersonProfile>>({ success: true, data: profile });
}
