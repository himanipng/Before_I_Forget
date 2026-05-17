import type { ApiResponse, MemoryCard, MemoryInput } from "./types";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const body = (await response.json().catch(() => ({}))) as ApiResponse<T>;

  if (!response.ok || !body.success) {
    throw new Error(body.error || "Something went wrong. Please try again.");
  }

  return body.data as T;
}

export function startMemory(input: MemoryInput) {
  return request<{
    executionArn?: string;
    memoryCard?: MemoryCard;
    mock: boolean;
    aiProvider?: "bedrock-claude" | "mock-ai";
  }>("/api/start-memory", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function saveMemory(memory: MemoryCard) {
  return request<MemoryCard>("/api/save-memory", {
    method: "POST",
    body: JSON.stringify(memory),
  });
}

export function listMemories() {
  return request<MemoryCard[]>("/api/memories");
}

export function getMemory(id: string) {
  return request<MemoryCard>(`/api/memories/${encodeURIComponent(id)}`);
}

export function getUploadUrl(fileName: string, contentType: string) {
  return request<{ uploadUrl: string; fileKey: string }>("/api/upload-url", {
    method: "POST",
    body: JSON.stringify({ fileName, contentType }),
  });
}

export function getWorkflowStatus(executionArn: string) {
  return request<{ status: string; output?: unknown; mock: boolean }>(
    `/api/workflow-status?executionArn=${encodeURIComponent(executionArn)}`,
  );
}
