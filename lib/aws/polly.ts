import { PollyClient, SynthesizeSpeechCommand, type VoiceId } from "@aws-sdk/client-polly";

let client: PollyClient | null = null;

export function getPollyClient() {
  if (!client) {
    client = new PollyClient({ region: process.env.AWS_REGION || "us-east-1" });
  }
  return client;
}

export async function synthesizeSpeechExample(text: string, voiceId = (process.env.POLLY_VOICE_ID || "Joanna") as VoiceId) {
  return getPollyClient().send(
    new SynthesizeSpeechCommand({
      OutputFormat: "mp3",
      Text: text,
      VoiceId: voiceId,
    }),
  );
}
