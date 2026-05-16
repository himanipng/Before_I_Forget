import { promises as fs } from "fs";
import path from "path";
import { GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { getDynamoDBDocumentClient } from "@/lib/aws/clients";
import { env, hasAwsConfig } from "@/lib/env";
import type { MemoryCard } from "./types";

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "memories.json");
const mockMemories: MemoryCard[] = [];

async function ensureStore() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, "[]", "utf8");
  }
}

function normalizeMemory(raw: MemoryCard & { id?: string }): MemoryCard {
  return {
    ...raw,
    memoryId: raw.memoryId || raw.id || `mem_${Date.now()}`,
    country: raw.country || "",
    status: raw.status || "SUCCEEDED",
  };
}

async function readMockMemories() {
  await ensureStore();
  const raw = await fs.readFile(dataFile, "utf8");
  const fileMemories = (JSON.parse(raw) as Array<MemoryCard & { id?: string }>).map(normalizeMemory);
  const merged = [...mockMemories, ...fileMemories];
  const byId = new Map(merged.map((memory) => [memory.memoryId, memory]));
  return Array.from(byId.values());
}

async function writeMockMemories(memories: MemoryCard[]) {
  await ensureStore();
  await fs.writeFile(dataFile, JSON.stringify(memories, null, 2), "utf8");
}

export async function saveMemory(memory: MemoryCard): Promise<MemoryCard> {
  const normalized = normalizeMemory(memory);
  const docClient = getDynamoDBDocumentClient();

  if (hasAwsConfig && docClient) {
    await docClient.send(
      new PutCommand({
        TableName: env.DYNAMODB_TABLE_NAME,
        Item: normalized,
      }),
    );
    return normalized;
  }

  const memories = await readMockMemories();
  const next = [normalized, ...memories.filter((item) => item.memoryId !== normalized.memoryId)];
  mockMemories.splice(0, mockMemories.length, ...next);
  await writeMockMemories(next);
  return normalized;
}

export async function getMemory(memoryId: string): Promise<MemoryCard | null> {
  const docClient = getDynamoDBDocumentClient();

  if (hasAwsConfig && docClient) {
    const result = await docClient.send(
      new GetCommand({
        TableName: env.DYNAMODB_TABLE_NAME,
        Key: { memoryId },
      }),
    );
    return result.Item ? (result.Item as MemoryCard) : null;
  }

  const memories = await readMockMemories();
  return memories.find((memory) => memory.memoryId === memoryId) || null;
}

export async function listMemories(): Promise<MemoryCard[]> {
  const docClient = getDynamoDBDocumentClient();

  if (hasAwsConfig && docClient) {
    const result = await docClient.send(
      new ScanCommand({
        TableName: env.DYNAMODB_TABLE_NAME,
      }),
    );
    return ((result.Items || []) as MemoryCard[]).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  const memories = await readMockMemories();
  return memories.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
