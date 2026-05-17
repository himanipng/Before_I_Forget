import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { env, hasAwsConfig } from "@/lib/env";
import type { GenerateMemoryCardInput, StartInterviewInput } from "@/lib/types";

const MODEL_ID = "anthropic.claude-3-5-haiku-20241022-v1:0";

let bedrockClient: BedrockRuntimeClient | null = null;

function getBedrockClient() {
  if (!hasAwsConfig) return null;
  if (!bedrockClient) {
    bedrockClient = new BedrockRuntimeClient({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return bedrockClient;
}

async function invoke(prompt: string): Promise<string> {
  const client = getBedrockClient();
  if (!client) throw new Error("Bedrock client unavailable — check AWS credentials.");

  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const response = await client.send(
    new InvokeModelCommand({ modelId: MODEL_ID, contentType: "application/json", body }),
  );

  const decoded = JSON.parse(Buffer.from(response.body).toString("utf8"));
  return decoded.content?.[0]?.text ?? "";
}

export async function generateInterviewQuestions(input: StartInterviewInput): Promise<string[]> {
  const person = input.personName?.trim() || `your ${input.relationship}`;
  const prompt = `You are helping someone preserve a meaningful memory of a loved one.

Generate exactly 5 warm, specific interview questions to help someone capture a memory about ${person}, their ${input.relationship} from ${input.country}.
Memory type: ${input.memoryType}
Goal: ${input.goal}
Language context: ${input.language}

Rules:
- Questions should feel gentle and conversational, not clinical
- Each question should draw out a specific sensory detail, emotion, or story
- Tailor questions to the memory type (${input.memoryType}) and cultural context (${input.country})
- Return ONLY a JSON array of 5 strings, no other text

Example format: ["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]`;

  const raw = await invoke(prompt);
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("Unexpected response format from Bedrock.");
  return JSON.parse(match[0]) as string[];
}

export async function generateMemoryCard(input: GenerateMemoryCardInput) {
  const person = input.personName?.trim() || "this person";
  const answers = input.answers.filter(Boolean).join("\n\n");

  const prompt = `You are a compassionate writer helping families preserve precious memories across distance and generations.

Based on these interview answers about ${person} (${input.relationship} from ${input.country}, memory type: ${input.memoryType}):

${answers}

Write a memory card with these exact JSON fields. Be warm, specific, and use details from the answers. Do not invent facts not present in the answers.

Return ONLY valid JSON with these fields:
{
  "title": "A poetic, specific title (max 10 words)",
  "summary": "3-4 sentences capturing the essence of this memory with warmth and detail",
  "quote": "The most meaningful phrase or sentence from the answers (verbatim or lightly edited)",
  "lesson": "One sentence: the wisdom or value this memory carries forward",
  "culturalContext": "1-2 sentences on how ${input.country} or ${input.language} shapes this memory",
  "followUpQuestion": "One gentle question to ask next time",
  "gratitudeLetter": "A short, heartfelt letter (3-5 sentences) from the interviewer to ${person}"
}`;

  const raw = await invoke(prompt);
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Unexpected response format from Bedrock.");
  return JSON.parse(match[0]) as {
    title: string;
    summary: string;
    quote: string;
    lesson: string;
    culturalContext: string;
    followUpQuestion: string;
    gratitudeLetter: string;
  };
}
