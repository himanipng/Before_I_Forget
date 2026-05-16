"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Globe2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { startMemory } from "@/lib/api";
import type { Goal, Language, MemoryType, Relationship } from "@/lib/types";

const relationships: Relationship[] = ["parent", "grandparent", "friend", "sibling", "teacher", "other"];
const languages: Language[] = ["English", "Hindi", "Spanish", "Mandarin", "Arabic", "Tagalog", "Vietnamese", "French", "other"];
const memoryTypes: MemoryType[] = ["life story", "recipe", "advice", "hardship", "childhood memory", "gratitude", "reconnecting"];
const goals: Goal[] = ["preserve story", "write thank-you letter", "translate memory", "create audio keepsake"];

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
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await startMemory(form);

      if (result.memoryCard) {
        localStorage.setItem("beforeIForget.pendingMemory", JSON.stringify(result.memoryCard));
        router.push(`/memory/${result.memoryCard.memoryId}`);
        return;
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
      <main className="min-h-screen bg-[linear-gradient(180deg,#fff8f1,#f5e5d8)] px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-rose-900 shadow-sm">
              <Globe2 size={16} /> Start Memory
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight text-stone-950 sm:text-6xl">
              Begin with someone you wish you could ask forever.
            </h1>
          </div>
          <form onSubmit={submit} className="rounded-[2rem] bg-white/85 p-5 shadow-xl shadow-rose-950/8 ring-1 ring-stone-900/5 sm:p-8">
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
                    placeholder="Write the story you want preserved..."
                  />
                </Field>
              </div>
            </div>
            {error ? (
              <p className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900">{error}</p>
            ) : null}
            <button disabled={loading} className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-rose-900 px-6 py-4 font-semibold text-white shadow-lg shadow-rose-950/15 transition hover:bg-rose-950 disabled:opacity-60 sm:w-auto">
              {loading ? "Starting memory..." : "Start memory workflow"} <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </main>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.14em] text-stone-500">{label}</span>
      {children}
    </label>
  );
}
