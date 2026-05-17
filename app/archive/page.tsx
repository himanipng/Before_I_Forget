"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Archive, Database, Search } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { listMemories } from "@/lib/api";
import type { MemoryCard } from "@/lib/types";

export default function ArchivePage() {
  const [memories, setMemories] = useState<MemoryCard[]>([]);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ relationship: "", country: "", memoryType: "", language: "" });

  useEffect(() => {
    listMemories()
      .then(setMemories)
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Unable to load memories."));
  }, []);

  const filtered = useMemo(() => {
    return memories.filter((memory) =>
      (!filters.relationship || memory.relationship === filters.relationship) &&
      (!filters.country || memory.country === filters.country) &&
      (!filters.memoryType || memory.memoryType === filters.memoryType) &&
      (!filters.language || memory.language === filters.language)
    );
  }, [filters, memories]);

  const unique = (key: keyof MemoryCard) => Array.from(new Set(memories.map((memory) => String(memory[key] || "")).filter(Boolean)));
  const newest = filtered[0];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[linear-gradient(180deg,#fff8f1,#fffaf5)] px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <section className="grid gap-5 rounded-[2rem] bg-stone-950 p-6 text-white shadow-xl shadow-rose-950/12 lg:grid-cols-[1fr_0.9fr]">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-rose-100">
                <Archive size={16} /> Archive
              </p>
              <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight sm:text-6xl">Saved memories from the workflow.</h1>
              <p className="mt-4 max-w-2xl leading-7 text-rose-50/75">
                This is the judging proof screen: after Start Memory runs, the newest DynamoDB-backed keepsake appears here.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                ["Saved cards", memories.length],
                ["Showing", filtered.length],
                ["Countries", unique("country").length],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-white/8 p-4 ring-1 ring-white/10">
                  <p className="text-sm text-rose-50/65">{label}</p>
                  <p className="mt-1 text-3xl font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </section>
          {newest ? (
            <Link
              href={`/memory/${newest.memoryId}`}
              className="mt-6 grid gap-4 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-stone-900/5 transition hover:-translate-y-0.5 hover:shadow-lg md:grid-cols-[1fr_auto]"
            >
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-rose-900">
                  <Database size={16} /> Newest saved result
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-stone-950">{newest.title}</h2>
                <p className="mt-2 max-w-3xl leading-7 text-stone-600">{newest.summary}</p>
              </div>
              <span className="self-center rounded-full bg-rose-900 px-5 py-3 text-sm font-semibold text-white">Open card</span>
            </Link>
          ) : null}
          <div className="mt-6 grid gap-3 rounded-[2rem] bg-white p-4 shadow-sm ring-1 ring-stone-900/5 md:grid-cols-4">
            {(["relationship", "country", "memoryType", "language"] as const).map((key) => (
              <select key={key} value={filters[key]} onChange={(e) => setFilters({ ...filters, [key]: e.target.value })} className="field">
                <option value="">{key === "memoryType" ? "memory type" : key}</option>
                {unique(key).map((item) => <option key={item}>{item}</option>)}
              </select>
            ))}
          </div>
          {error ? <p className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900">{error}</p> : null}
          {filtered.length ? (
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((memory) => (
                <Link key={memory.memoryId} href={`/memory/${memory.memoryId}`} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-stone-900/5 transition hover:-translate-y-1 hover:shadow-lg">
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-rose-900">{memory.relationship} · {memory.language}</p>
                  <h2 className="mt-3 text-2xl font-semibold text-stone-950">{memory.title}</h2>
                  <p className="mt-3 line-clamp-4 leading-7 text-stone-600">{memory.summary}</p>
                  <p className="mt-4 text-sm text-stone-500">{memory.personName}{memory.country ? `, ${memory.country}` : ""}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-[2rem] border border-dashed border-rose-900/25 bg-white/70 p-10 text-center">
              <Search className="mx-auto text-rose-900" />
              <h2 className="mt-4 text-2xl font-semibold text-stone-950">No memories saved yet.</h2>
              <p className="mx-auto mt-3 max-w-xl leading-7 text-stone-600">Start with one person and one ordinary detail. The archive will fill from there.</p>
              <Link href="/start" className="mt-6 inline-flex rounded-full bg-rose-900 px-5 py-3 font-semibold text-white">Start a Memory</Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
