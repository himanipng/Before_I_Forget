"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, NotebookPen } from "lucide-react";
import { InterviewQuestionList } from "@/components/InterviewQuestionList";
import { Navbar } from "@/components/Navbar";
import { UploadBox } from "@/components/UploadBox";
import type { Goal, Language, MemoryType, Relationship } from "@/lib/types";

type Session = {
  personName: string;
  relationship: Relationship;
  country: string;
  language: Language;
  memoryType: MemoryType;
  goal: Goal;
  questions: string[];
};

export default function InterviewPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [fileName, setFileName] = useState("nani-chai-story.m4a");
  const [fileKey, setFileKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("beforeIForget.session");
    if (!raw) {
      router.push("/start");
      return;
    }
    const parsed = JSON.parse(raw) as Session;
    queueMicrotask(() => {
      setSession(parsed);
      setAnswers(new Array(parsed.questions.length).fill(""));
    });
  }, [router]);

  async function transcribe() {
    if (!session) return;
    setBusy(true);
    setStatus(fileKey ? "Starting Amazon Transcribe job..." : "Preparing a transcript from the backup path...");

    try {
      const response = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, fileKey, language: session.language, identifyLanguage: true }),
      });
      const data = await response.json();

      if (data.mode === "async" && data.jobName) {
        setStatus("Transcribe is listening. This may take a moment...");
        const transcript = await waitForTranscript(data.jobName);
        fillFirstAnswer(transcript || "Transcription job started. Refresh status in AWS Transcribe if the transcript is still processing.");
      } else {
        fillFirstAnswer(data.transcript);
      }
    } finally {
      setStatus("");
      setBusy(false);
    }
  }

  function fillFirstAnswer(transcript: string) {
    setAnswers((current) => {
      const next = [...current];
      next[0] = transcript;
      return next;
    });
  }

  async function generateCard() {
    if (!session) return;
    setBusy(true);
    const response = await fetch("/api/generate-memory-card", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...session, answers }),
    });
    const data = await response.json();
    const memory = { ...session, ...data };
    localStorage.setItem("beforeIForget.pendingMemory", JSON.stringify(memory));
    router.push(`/memory/${data.id}`);
  }

  if (!session) return null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#fffaf5] px-4 py-10 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.7fr_1.3fr]">
          <aside className="h-fit rounded-[2rem] bg-white/88 p-6 text-stone-950 shadow-xl shadow-rose-950/8 ring-1 ring-rose-900/10">
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-rose-900">
              <NotebookPen size={16} /> Interview
            </p>
            <h1 className="mt-4 text-4xl font-semibold">{session.personName}</h1>
            <div className="mt-5 space-y-3 text-sm text-stone-600">
              <p>{session.relationship} in {session.country}</p>
              <p>{session.language} · {session.memoryType}</p>
              <p>Goal: {session.goal}</p>
            </div>
            <div className="mt-8 rounded-3xl bg-[#fff8f1] p-5 leading-7 text-stone-700 ring-1 ring-rose-900/10">
              Let the answer be imperfect. The app will turn fragments into a memory card, but the feeling comes from what you write here.
            </div>
          </aside>
          <section className="space-y-5">
            <UploadBox
              fileName={fileName}
              fileKey={fileKey}
              onFileNameChange={setFileName}
              onFileKeyChange={setFileKey}
              onTranscribe={transcribe}
              isBusy={busy}
            />
            {status ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900">{status}</p> : null}
            <InterviewQuestionList
              questions={session.questions}
              answers={answers}
              onAnswer={(index, answer) => setAnswers((current) => current.map((item, itemIndex) => (itemIndex === index ? answer : item)))}
            />
            <button onClick={generateCard} disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-rose-900 px-6 py-4 font-semibold text-white shadow-lg shadow-rose-950/15 transition hover:bg-rose-950 disabled:opacity-60 sm:w-auto">
              Generate memory card <ArrowRight size={18} />
            </button>
          </section>
        </div>
      </main>
    </>
  );
}

async function waitForTranscript(jobName: string) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, attempt === 0 ? 1200 : 3000));
    const response = await fetch(`/api/transcribe?jobName=${encodeURIComponent(jobName)}`);
    const data = await response.json();

    if (data.status === "COMPLETED") {
      return data.transcript || "";
    }

    if (data.status === "FAILED") {
      throw new Error(data.failureReason || "Amazon Transcribe failed for this audio.");
    }
  }

  return "";
}
