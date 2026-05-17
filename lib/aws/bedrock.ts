import { InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { env, hasBedrockConfig } from "@/lib/env";
import { generateInterviewQuestions, generateMemoryCard } from "@/lib/mockAI";
import { generateMockMemoryCard } from "@/lib/mockMemory";
import type { GenerateMemoryCardInput, MemoryCard, MemoryInput, StartInterviewInput } from "@/lib/types";
import { getBedrockRuntimeClient } from "./clients";

type BedrockResult<T> = {
  data: T;
  provider: "bedrock-claude" | "mock-ai";
  warning?: string;
};

type MemoryCardFields = {
  title: string;
  summary: string;
  quote: string;
  lesson: string;
  culturalContext: string;
  followUpQuestion: string;
  gratitudeLetter: string;
};

const SYSTEM_PROMPT = [
  "You generate emotionally precise family memory keepsakes for Before I Forget.",
  "Return only valid JSON. Do not wrap the JSON in markdown.",
  "Keep the tone warm, specific, culturally careful, and demo-safe.",
].join(" ");

function asErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Bedrock Claude request failed.";
}

function extractJson(text: string) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first >= 0 && last > first) return trimmed.slice(first, last + 1);
  return trimmed;
}

async function invokeClaudeJson<T>(prompt: string): Promise<T> {
  const client = getBedrockRuntimeClient();

  if (!hasBedrockConfig || !client) {
    throw new Error("Bedrock config missing; using mock AI.");
  }

  const response = await client.send(
    new InvokeModelCommand({
      modelId: env.BEDROCK_MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 1400,
        temperature: 0.4,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: prompt }],
      }),
    }),
  );

  const raw = new TextDecoder().decode(response.body);
  const payload = JSON.parse(raw) as { content?: Array<{ text?: string }> };
  const text = payload.content?.map((block) => block.text || "").join("").trim();

  if (!text) {
    throw new Error("Bedrock Claude returned an empty response.");
  }

  return JSON.parse(extractJson(text)) as T;
}

function validateQuestions(value: unknown): string[] {
  const questions = Array.isArray(value)
    ? value
    : typeof value === "object" && value
      ? (value as { questions?: unknown }).questions
      : undefined;

  if (!Array.isArray(questions)) {
    throw new Error("Bedrock Claude did not return questions.");
  }

  const cleaned = questions.map((question) => String(question || "").trim()).filter(Boolean).slice(0, 5);
  if (cleaned.length < 3) {
    throw new Error("Bedrock Claude returned too few questions.");
  }
  return cleaned;
}

function validateMemoryCardFields(value: unknown): MemoryCardFields {
  const candidate = value as Partial<MemoryCardFields>;
  const fields: Array<keyof MemoryCardFields> = [
    "title",
    "summary",
    "quote",
    "lesson",
    "culturalContext",
    "followUpQuestion",
    "gratitudeLetter",
  ];

  for (const field of fields) {
    if (!String(candidate?.[field] || "").trim()) {
      throw new Error(`Bedrock Claude response missing ${field}.`);
    }
  }

  return {
    title: String(candidate.title),
    summary: String(candidate.summary),
    quote: String(candidate.quote),
    lesson: String(candidate.lesson),
    culturalContext: String(candidate.culturalContext),
    followUpQuestion: String(candidate.followUpQuestion),
    gratitudeLetter: String(candidate.gratitudeLetter),
  };
}

export async function generateInterviewQuestionsWithBedrock(
  input: StartInterviewInput,
): Promise<BedrockResult<string[]>> {
  const fallback = generateInterviewQuestions(input);

  try {
    const data = await invokeClaudeJson<{ questions: string[] }>(
      [
        "Create five gentle interview questions for this memory-preservation session.",
        "Return JSON with exactly this shape: {\"questions\":[\"...\"]}.",
        `Input: ${JSON.stringify(input)}`,
      ].join("\n\n"),
    );

    return { data: validateQuestions(data), provider: "bedrock-claude" };
  } catch (error) {
    return { data: fallback, provider: "mock-ai", warning: asErrorMessage(error) };
  }
}

export async function generateMemoryCardWithBedrock(
  input: GenerateMemoryCardInput,
): Promise<BedrockResult<MemoryCardFields>> {
  const fallback = generateMemoryCard(input);

  try {
    const data = await invokeClaudeJson<MemoryCardFields>(
      [
        "Turn these interview answers into a polished memory card.",
        "Return JSON with exactly these string fields: title, summary, quote, lesson, culturalContext, followUpQuestion, gratitudeLetter.",
        "Make it personal and specific. Avoid generic filler.",
        `Input: ${JSON.stringify(input)}`,
      ].join("\n\n"),
    );

    return { data: validateMemoryCardFields(data), provider: "bedrock-claude" };
  } catch (error) {
    return { data: fallback, provider: "mock-ai", warning: asErrorMessage(error) };
  }
}

export async function generateMemoryFromStoryWithBedrock(input: MemoryInput): Promise<BedrockResult<MemoryCard>> {
  const fallback = generateMockMemoryCard(input);

  try {
    const data = await invokeClaudeJson<MemoryCardFields>(
      [
        "Turn this single story into a complete Before I Forget memory card.",
        "Return JSON with exactly these string fields: title, summary, quote, lesson, culturalContext, followUpQuestion, gratitudeLetter.",
        "The quote should come from the provided story text. The gratitude letter should be short enough to read aloud.",
        `Input: ${JSON.stringify(input)}`,
      ].join("\n\n"),
    );

    return {
      data: {
        ...fallback,
        ...validateMemoryCardFields(data),
        status: "SUCCEEDED",
      },
      provider: "bedrock-claude",
    };
  } catch (error) {
    return { data: fallback, provider: "mock-ai", warning: asErrorMessage(error) };
  }
}
