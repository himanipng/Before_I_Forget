"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Heart, PencilLine } from "lucide-react";
import { UploadBox } from "@/components/UploadBox";
import { startMemory } from "@/lib/api";
import type { Language, MemoryType, Relationship } from "@/lib/types";

const memoryTypes: Array<{ label: string; value: MemoryType }> = [
  { label: "A life story", value: "life story" },
  { label: "A recipe", value: "recipe" },
  { label: "Advice", value: "advice" },
  { label: "A childhood memory", value: "childhood memory" },
  { label: "Something hard", value: "hardship" },
  { label: "A thank-you message", value: "gratitude" },
];

export default function ElderPage() {
  const [form, setForm] = useState({
    personName: "",
    relationship: "grandparent" as Relationship,
    country: "",
    language: "English" as Language,
    memoryType: "life story" as MemoryType,
    storyText: "",
  });
  const [fileName, setFileName] = useState("family-memory-recording.m4a");
  const [fileKey, setFileKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [savedUrl, setSavedUrl] = useState("");

  async function transcribeAudio() {
    if (!fileKey) {
      setMessage("Please record or upload audio first.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("Writing down the recording...");

    try {
      const response = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, fileKey, language: form.language, identifyLanguage: true }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "We could not write down that recording yet.");
      }

      if (data.mode === "async" && data.jobName) {
        const transcript = await waitForTranscript(data.jobName);
        setForm((current) => ({ ...current, storyText: transcript || current.storyText }));
      } else if (data.transcript) {
        setForm((current) => ({ ...current, storyText: data.transcript }));
      }

      setMessage("The recording has been written into the story box.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not write down that recording yet.");
      setMessage("");
    } finally {
      setBusy(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("Saving this memory...");
    setSavedUrl("");

    try {
      const result = await startMemory({
        ...form,
        personName: form.personName.trim() || "A loved one",
        country: form.country.trim() || "Home",
        storyText: form.storyText.trim() || "A voice recording was uploaded for the family to preserve.",
        goal: "preserve story",
      });

      const memory = result.memoryCard;
      if (memory) {
        setSavedUrl(`/memory/${memory.memoryId}`);
        setMessage("Saved. Your family can open this keepsake now.");
      } else {
        setMessage("The memory workflow has started. Your family can check the archive shortly.");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not save this memory yet.");
      setMessage("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff7ed,#f2dfcf)] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-xl font-semibold text-stone-950">
            Before I <span className="text-rose-900">Forget</span>
          </Link>
          <Link href="/start" className="rounded-full bg-white px-5 py-3 text-base font-semibold text-stone-800 shadow-sm ring-1 ring-stone-200">
            Family view
          </Link>
        </div>

        <section className="mt-8 rounded-[2rem] bg-white/88 p-6 shadow-xl shadow-rose-950/10 ring-1 ring-stone-900/5 sm:p-10">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2 text-lg font-semibold text-rose-950">
              <Heart size={22} /> For elders
            </p>
            <h1 className="mt-5 text-5xl font-semibold leading-tight text-stone-950 sm:text-7xl">
              Tell one memory.
            </h1>
            <p className="mt-5 text-2xl leading-10 text-stone-600">
              You can record your voice, upload a file, or type a few lines. Your family can turn it into a keepsake later.
            </p>
          </div>

          <form onSubmit={submit} className="mt-8 grid gap-6">
            <div className="grid gap-5 md:grid-cols-2">
              <BigField label="Your name">
                <input
                  value={form.personName}
                  onChange={(event) => setForm({ ...form, personName: event.target.value })}
                  className="elder-field"
                  placeholder="What should your family call you?"
                />
              </BigField>
              <BigField label="Where is this memory from?">
                <input
                  value={form.country}
                  onChange={(event) => setForm({ ...form, country: event.target.value })}
                  className="elder-field"
                  placeholder="City, country, or home"
                />
              </BigField>
            </div>

            <section>
              <p className="mb-3 text-2xl font-semibold text-stone-950">What kind of memory is it?</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {memoryTypes.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setForm({ ...form, memoryType: item.value })}
                    className={`rounded-3xl px-5 py-5 text-left text-xl font-semibold ring-1 transition ${
                      form.memoryType === item.value
                        ? "bg-rose-900 text-white ring-rose-900"
                        : "bg-white text-stone-900 ring-stone-200 hover:bg-rose-50"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </section>

            <UploadBox
              fileName={fileName}
              fileKey={fileKey}
              onFileNameChange={setFileName}
              onFileKeyChange={setFileKey}
              onTranscribe={transcribeAudio}
              isBusy={busy}
            />

            <BigField label="Or type the memory here">
              <textarea
                value={form.storyText}
                onChange={(event) => setForm({ ...form, storyText: event.target.value })}
                className="elder-field min-h-52 resize-none leading-9"
                placeholder="Start anywhere. A smell, a song, a recipe, a lesson, a person..."
              />
            </BigField>

            {message ? (
              <p className="rounded-3xl bg-emerald-50 px-5 py-4 text-xl font-semibold text-emerald-900">
                {message}
              </p>
            ) : null}
            {error ? (
              <p className="rounded-3xl bg-rose-50 px-5 py-4 text-xl font-semibold text-rose-900">
                {error}
              </p>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                disabled={busy}
                className="inline-flex items-center justify-center gap-3 rounded-full bg-rose-900 px-8 py-5 text-2xl font-semibold text-white shadow-lg shadow-rose-950/15 transition hover:bg-rose-950 disabled:opacity-60"
              >
                {busy ? "Saving..." : "Save this memory"} <ArrowRight size={24} />
              </button>
              {savedUrl ? (
                <Link
                  href={savedUrl}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-5 text-xl font-semibold text-stone-900 ring-1 ring-stone-200"
                >
                  <CheckCircle2 size={22} /> Open keepsake
                </Link>
              ) : null}
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

function BigField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-3 flex items-center gap-2 text-2xl font-semibold text-stone-950">
        <PencilLine size={22} /> {label}
      </span>
      {children}
    </label>
  );
}

async function waitForTranscript(jobName: string) {
  for (let attempt = 0; attempt < 16; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, attempt === 0 ? 1200 : 3000));
    const response = await fetch(`/api/transcribe?jobName=${encodeURIComponent(jobName)}`);
    const data = await response.json();

    if (data.status === "COMPLETED" || data.provider === "mock-transcribe") {
      return data.transcript || "";
    }

    if (data.status === "FAILED") {
      throw new Error("The recording could not be written down.");
    }
  }

  return "";
}
