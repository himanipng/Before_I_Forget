import { promises as fs } from "fs";
import path from "path";
import type { MemoryCardData } from "./types";

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "memories.json");

async function ensureStore() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, "[]", "utf8");
  }
}

export async function listMemories(): Promise<MemoryCardData[]> {
  await ensureStore();
  const raw = await fs.readFile(dataFile, "utf8");
  return JSON.parse(raw) as MemoryCardData[];
}

export async function saveMemory(memory: MemoryCardData) {
  const memories = await listMemories();
  const next = [memory, ...memories.filter((item) => item.id !== memory.id)];
  await fs.writeFile(dataFile, JSON.stringify(next, null, 2), "utf8");
  return memory;
}

export async function getMemory(id: string) {
  const memories = await listMemories();
  return memories.find((memory) => memory.id === id) || null;
}
