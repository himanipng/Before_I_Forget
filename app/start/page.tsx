"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Database, GitBranch, Globe2, Mic, PlayCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { UploadBox } from "@/components/UploadBox";
import { getWorkflowStatus, startMemory } from "@/lib/api";
import type { Goal, Language, MemoryCard, MemoryType, Relationship } from "@/lib/types";
import type { LucideIcon } from "lucide-react";

const relationships: Relationship[] = ["parent", "grandparent", "friend", "sibling", "teacher", "other"];
const languages: Language[] = ["English", "Hindi", "Spanish", "Mandarin", "Arabic", "Tagalog", "Vietnamese", "French", "other"];
const memoryTypes: MemoryType[] = ["life story", "recipe", "advice", "hardship", "childhood memory", "gratitude", "reconnecting"];
const goals: Goal[] = ["preserve story", "write thank-you letter", "translate memory", "create audio keepsake"];
const demoSteps: Array<[LucideIcon, string]> = [
  [PlayCircle, "Click Start memory workflow"],
  [GitBranch, "Claude via Bedrock drafts the card"],
  [Database, "Memory opens and appears in Archive"],
];

export default function StartPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    personName: "Nani",
    relationship: "grandparent" as Relationship,
    country: "India",
    language: "Hindi" as Language,
    memoryType: "recipe" as MemoryType,
    goal: "preserve story" as Goal,
    storyText:
      "She made chai every morning before school. She crushed ginger with cardamom and waited until the kitchen smelled warm.",
  });
  const [loading, setLoading] = useState(false);
  const [audioBusy, setAudioBusy] = useState(false);
  const [fileName, setFileName] = useState("nani-chai-story.m4a");
  const [fileKey, setFileKey] = useState("");
  const [audioStatus, setAudioStatus] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");

  async function transcribeAudio() {
    if (!fileKey) {
      setAudioStatus("Record or upload audio first, then start Amazon Transcribe.");
      return;
    }

    setAudioBusy(true);
    setAudioStatus("Starting Amazon Transcribe...");
    setError("");

    try {
      const response = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, fileKey, language: form.language, identifyLanguage: true }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error("The transcript could not start. You can keep the typed story and continue.");
      }

      if (data.mode === "async" && data.jobName) {
        setAudioStatus("Transcribe is processing the recording...");
        const transcript = await waitForTranscript(data.jobName);
        if (!transcript.trim()) {
          throw new Error("The transcript came back empty. You can keep the typed story and continue.");
        }
        setForm((current) => ({ ...current, storyText: transcript }));
      } else if (data.transcript?.trim()) {
        setForm((current) => ({ ...current, storyText: data.transcript || current.storyText }));
      } else {
        throw new Error("The transcript is taking longer than expected. You can keep the typed story and continue.");
      }

      setAudioStatus(data.provider === "mock-transcribe" ? "Transcript filled from the backup path." : "Real Amazon Transcribe transcript filled into the story field.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to fill the transcript. You can keep the typed story and continue.");
      setAudioStatus("");
    } finally {
      setAudioBusy(false);
    }
  }

  async function startInterview() {
    setLoading(true);
    setStatusMessage("Generating gentle interview questions...");
    setError("");

    try {
      const response = await fetch("/api/start-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to generate interview questions.");
      }

      localStorage.setItem("beforeIForget.session", JSON.stringify({ ...form, questions: data.questions || [] }));
      router.push("/interview");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to start the interview.");
    } finally {
      setLoading(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setStatusMessage("Starting the memory workflow...");
    setError("");

    try {
      const result = await startMemory(form);

      if (result.memoryCard) {
        localStorage.setItem("beforeIForget.pendingMemory", JSON.stringify(result.memoryCard));
        router.push(`/memory/${result.memoryCard.memoryId}`);
        return;
      }

      if (result.executionArn) {
        setStatusMessage("Listening for the workflow result...");
        const completedMemory = await waitForWorkflow(result.executionArn);

        if (completedMemory) {
          localStorage.setItem("beforeIForget.pendingMemory", JSON.stringify(completedMemory));
          router.push(`/memory/${completedMemory.memoryId}`);
          return;
        }
      }

      localStorage.setItem("beforeIForget.workflow", JSON.stringify({ ...form, executionArn: result.executionArn }));
      router.push("/archive");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to start this memory.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[linear-gradient(180deg,#fff8f1,#f5e5d8)] px-4 py-8 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[2rem] border border-rose-900/10 bg-white/88 p-6 text-stone-950 shadow-xl shadow-rose-950/10 sm:p-8">
              <p className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-900">
                <Globe2 size={15} /> Guided workflow
              </p>
              <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">Run one memory from input to archive.</h1>
              <p className="mt-4 leading-7 text-stone-600">
                The form is prefilled so you can start immediately. The workflow saves a card first, then the archive shows it persisted.
              </p>
              <div className="mt-6 grid gap-3">
                {demoSteps.map(([Icon, label]) => (
                  <div key={label} className="flex items-center gap-3 rounded-2xl bg-[#fff8f1] p-4 ring-1 ring-rose-900/10">
                    <span className="grid size-9 place-items-center rounded-full bg-rose-100 text-rose-950">
                      <Icon size={17} />
                    </span>
                    <span className="font-medium">{label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl bg-rose-50 p-4 text-stone-950 ring-1 ring-rose-900/10">
                <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-rose-900">
                  <CheckCircle2 size={16} /> Fallback safe
                </p>
                <p className="mt-2 text-sm leading-6 text-stone-700">
                  If AWS takes longer than expected, the same button keeps the memory flow moving with a backup card.
                </p>
              </div>
            </div>
          </aside>

          <form onSubmit={submit} className="rounded-[2rem] bg-white/88 p-5 shadow-xl shadow-rose-950/8 ring-1 ring-stone-900/5 sm:p-8">
            <div className="mb-6 flex flex-col gap-3 border-b border-stone-900/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-900">Memory setup</p>
                <h2 className="mt-2 text-3xl font-semibold text-stone-950">Nani&apos;s chai story</h2>
              </div>
              <button disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-rose-900 px-6 py-4 font-semibold text-white shadow-lg shadow-rose-950/15 transition hover:bg-rose-950 disabled:opacity-60 sm:w-auto">
                {loading ? "Starting memory..." : "Start workflow"} <ArrowRight size={18} />
              </button>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Person's name">
                <input value={form.personName} onChange={(e) => setForm({ ...form, personName: e.target.value })} className="field" />
              </Field>
              <Field label="Country/location">
                <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="field" />
              </Field>
              <Field label="Relationship">
                <select value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value as Relationship })} className="field">
                  {relationships.map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="Language">
                <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value as Language })} className="field">
                  {languages.map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="Memory type">
                <select value={form.memoryType} onChange={(e) => setForm({ ...form, memoryType: e.target.value as MemoryType })} className="field">
                  {memoryTypes.map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="Goal">
                <select value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value as Goal })} className="field">
                  {goals.map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>
              <div className="md:col-span-2">
                <Field label="Story or voice-note transcript">
                  <textarea
                    value={form.storyText}
                    onChange={(e) => setForm({ ...form, storyText: e.target.value })}
                    className="field min-h-40 resize-none leading-7"
                    placeholder="Record or upload audio to fill this with Amazon Transcribe, or type the story here..."
                  />
                </Field>
              </div>
              <div className="md:col-span-2">
                <UploadBox
                  fileName={fileName}
                  fileKey={fileKey}
                  onFileNameChange={setFileName}
                  onFileKeyChange={setFileKey}
                  onTranscribe={transcribeAudio}
                  isBusy={audioBusy}
                />
                {audioStatus ? <p className="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900">{audioStatus}</p> : null}
              </div>
            </div>
            {error ? (
              <p className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900">{error}</p>
            ) : null}
            <div className="mt-7 flex flex-col gap-3 border-t border-stone-900/10 pt-6 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={startInterview}
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 font-semibold text-rose-950 shadow-sm ring-1 ring-rose-900/15 transition hover:bg-rose-50 disabled:opacity-60 sm:w-auto"
              >
                Generate interview questions <Mic size={18} />
              </button>
              <button disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-rose-900 px-6 py-4 font-semibold text-white shadow-lg shadow-rose-950/15 transition hover:bg-rose-950 disabled:opacity-60 sm:w-auto">
                {loading ? "Starting memory..." : "Start memory workflow"} <ArrowRight size={18} />
              </button>
              {loading && statusMessage ? <p className="text-sm font-medium text-stone-600">{statusMessage}</p> : null}
            </div>
          </form>
        </div>
      </main>
    </>
  );
}

async function waitForTranscript(jobName: string) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, attempt === 0 ? 1200 : 3000));
    const response = await fetch(`/api/transcribe?jobName=${encodeURIComponent(jobName)}`);
    const data = await response.json();

    if (data.provider === "mock-transcribe") {
      return data.transcript || "";
    }

    if (data.status === "COMPLETED") {
      return data.transcript || "";
    }

    if (data.status === "FAILED") {
      throw new Error("The transcript could not be completed for this recording. You can keep the typed story and continue.");
    }
  }

  throw new Error("The transcript is still processing. You can keep the typed story and continue.");
}

async function waitForWorkflow(executionArn: string): Promise<MemoryCard | null> {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, attempt === 0 ? 800 : 2000));
    const status = await getWorkflowStatus(executionArn);

    if (status.status === "SUCCEEDED") {
      return isMemoryCard(status.output) ? status.output : null;
    }

    if (status.status === "FAILED" || status.status === "TIMED_OUT" || status.status === "ABORTED") {
      throw new Error("The memory workflow did not finish. Please try again.");
    }
  }

  return null;
}

function isMemoryCard(value: unknown): value is MemoryCard {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<MemoryCard>;
  return Boolean(candidate.memoryId && candidate.title && candidate.summary && candidate.gratitudeLetter);
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.14em] text-stone-500">{label}</span>
      {children}
    </label>
  );
}
