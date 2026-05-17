"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Database } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { listMemories } from "@/lib/api";
import type { MemoryCard } from "@/lib/types";

const GRADIENTS = [
  "linear-gradient(160deg, #C8A882 0%, #7A5030 45%, #3E2010 100%)",
  "linear-gradient(160deg, #B8C4BC 0%, #6A7E72 45%, #2E3E38 100%)",
  "linear-gradient(160deg, #C4B090 0%, #7B5C38 45%, #3D2818 100%)",
  "linear-gradient(160deg, #D4C4A0 0%, #8B7248 45%, #453820 100%)",
  "linear-gradient(160deg, #C0B4A8 0%, #7A6858 45%, #3C2E28 100%)",
  "linear-gradient(160deg, #D0C0A0 0%, #886040 45%, #402818 100%)",
];

function monthYear(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

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
    return memories.filter((m) =>
      (!filters.relationship || m.relationship === filters.relationship) &&
      (!filters.country || m.country === filters.country) &&
      (!filters.memoryType || m.memoryType === filters.memoryType) &&
      (!filters.language || m.language === filters.language)
    );
  }, [filters, memories]);

  const unique = (key: keyof MemoryCard) =>
    Array.from(new Set(memories.map((m) => String(m[key] || "")).filter(Boolean)));

  const newest = filtered[0];

  return (
    <>
      <Navbar />
      <main className="min-h-screen px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-900">Archive</p>
          <h1
            className="mt-2 max-w-3xl text-5xl leading-tight text-stone-900 sm:text-6xl"
            style={{ fontFamily: "var(--font-lora), Georgia, serif", fontStyle: "italic" }}
          >
            Gratitude, Preserved
          </h1>
          <p className="mt-1 text-sm italic text-stone-500" style={{ fontFamily: "var(--font-lora), Georgia, serif" }}>
            Tap any memory to open it.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {([
              ["Saved cards", memories.length],
              ["Showing", filtered.length],
              ["Countries", unique("country").length],
            ] as [string, number][]).map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-[#DFD0C0] bg-white/70 p-4">
                <p className="text-sm text-stone-500">{label}</p>
                <p className="mt-1 text-3xl font-semibold text-stone-900">{value}</p>
              </div>
            ))}
          </div>

          {newest && (
            <Link
              href={`/memory/${newest.memoryId}`}
              className="mt-5 flex items-center justify-between gap-4 rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-[#E0D4C8] transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-rose-900">
                  <Database size={14} /> Newest saved result
                </p>
                <p className="mt-2 text-lg font-semibold text-stone-900">{newest.title}</p>
                <p className="mt-1 line-clamp-1 text-sm text-stone-500">{newest.summary}</p>
              </div>
              <span className="shrink-0 rounded-full bg-[#881337] px-4 py-2 text-sm font-semibold text-white">
                Open card
              </span>
            </Link>
          )}

          <div className="mt-5 grid gap-3 rounded-2xl border border-[#DFD0C0] bg-white/70 p-4 md:grid-cols-4">
            {(["relationship", "country", "memoryType", "language"] as const).map((key) => (
              <select
                key={key}
                value={filters[key]}
                onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
                className="field"
              >
                <option value="">{key === "memoryType" ? "memory type" : key}</option>
                {unique(key).map((item) => <option key={item}>{item}</option>)}
              </select>
            ))}
          </div>

          {error && (
            <p className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900">{error}</p>
          )}

          {filtered.length > 0 ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((memory, i) => (
                <Link
                  key={memory.memoryId}
                  href={`/memory/${memory.memoryId}`}
                  className="group block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#E0D4C8] transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="h-44 w-full" style={{ background: GRADIENTS[i % GRADIENTS.length] }} />
                  <div className="p-5">
                    <p className="text-[1.1rem] font-semibold text-stone-900">{memory.personName}</p>
                    <p className="mt-0.5 text-sm text-stone-500">{memory.relationship} · {memory.country}</p>
                    <p className="mt-3 text-[0.92rem] font-semibold leading-snug text-stone-800">{memory.title}</p>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-500">{memory.summary}</p>
                    <p className="mt-4 text-xs text-stone-400">{monthYear(memory.createdAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-[#D4C4B4] bg-white/60 p-12 text-center">
              <p className="text-3xl">🕯️</p>
              <h2 className="mt-4 text-2xl font-semibold text-stone-900">No memories saved yet.</h2>
              <p className="mx-auto mt-3 max-w-md leading-7 text-stone-500">
                Start with one person and one ordinary detail. The archive will fill from there.
              </p>
              <Link
                href="/start"
                className="mt-6 inline-block rounded-full bg-[#881337] px-5 py-3 font-semibold text-white transition hover:bg-[#4c0519]"
              >
                Start a Memory
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
