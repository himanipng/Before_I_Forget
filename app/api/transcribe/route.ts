import { NextResponse } from "next/server";
import { simulateTranscript } from "@/lib/mockAI";
import { getMemoryTranscriptionJob, startMemoryTranscriptionJob } from "@/lib/aws/transcribe";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const fileName = body.fileName || body.fakeFileName || "voice-note.m4a";
  const fileKey = body.fileKey;
  const mediaUri = body.mediaUri;
  const language = body.language;

  if (fileKey || mediaUri) {
    try {
      const job = await startMemoryTranscriptionJob({
        fileName,
        fileKey,
        mediaUri,
        language,
        identifyLanguage: body.identifyLanguage !== false,
      });

      if (job) {
        return NextResponse.json({
          transcript: "",
          provider: "aws-transcribe",
          mode: "async",
          jobName: job.jobName,
          status: job.status,
          mediaUri: job.mediaUri,
        });
      }
    } catch (error) {
      return NextResponse.json({
        transcript: simulateTranscript(fileName),
        provider: "mock-transcribe",
        mode: "mock",
        status: "COMPLETED",
        warning: error instanceof Error ? error.message : "Amazon Transcribe was unavailable, so the demo used a mock transcript.",
      });
    }
  }

  const transcript = simulateTranscript(fileName);
  return NextResponse.json({
    transcript,
    provider: "mock-transcribe",
    mode: "mock",
    status: "COMPLETED",
    awsReady: "Upload audio to S3 with /api/upload-url, then POST fileKey here to start Amazon Transcribe.",
  });
}

export async function GET(request: Request) {
  const jobName = new URL(request.url).searchParams.get("jobName");

  if (!jobName) {
    return NextResponse.json({ error: "jobName is required." }, { status: 400 });
  }

  let job;

  try {
    job = await getMemoryTranscriptionJob(jobName);
  } catch (error) {
    return NextResponse.json({
      provider: "mock-transcribe",
      mode: "mock",
      status: "COMPLETED",
      transcript: simulateTranscript(jobName),
      warning: error instanceof Error ? error.message : "Amazon Transcribe status was unavailable, so the demo used a mock transcript.",
    });
  }

  if (!job) {
    return NextResponse.json({
      provider: "mock-transcribe",
      mode: "mock",
      status: "COMPLETED",
      transcript: simulateTranscript(jobName),
    });
  }

  let transcript = "";

  if (job.status === "COMPLETED" && job.transcriptUri) {
    try {
      const response = await fetch(job.transcriptUri);
      const payload = await response.json();
      transcript = payload?.results?.transcripts?.[0]?.transcript || "";
    } catch {
      transcript = "";
    }
  }

  return NextResponse.json({
    provider: "aws-transcribe",
    mode: "async",
    ...job,
    transcript,
  });
}
