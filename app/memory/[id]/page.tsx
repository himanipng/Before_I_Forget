"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, Languages, Save, Volume2 } from "lucide-react";
import { MemoryCard } from "@/components/MemoryCard";
import { Navbar } from "@/components/Navbar";
import type { MemoryCardData } from "@/lib/types";

export default function MemoryPage() {
  const [memory, setMemory] = useState<MemoryCardData | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("beforeIForget.pendingMemory");
    if (raw) {
      queueMicrotask(() => setMemory(JSON.parse(raw)));
    }
  }, []);

  async function translate() {
    if (!memory) return;
    setBusy("translate");
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: memory.summary, sourceLanguage: memory.language, targetLanguage: "English" }),
    });
    const data = await response.json();
    setMemory({ ...memory, translatedText: data.translatedText });
    localStorage.setItem("beforeIForget.pendingMemory", JSON.stringify({ ...memory, translatedText: data.translatedText }));
    setBusy("");
  }

  async function generateAudio() {
    if (!memory) return;
    setBusy("audio");
    const response = await fetch("/api/polly", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gratitudeLetter: memory.gratitudeLetter, voice: "Joanna" }),
    });
    const data = await response.json();
    setMemory({ ...memory, audioUrl: data.audioUrl });
    localStorage.setItem("beforeIForget.pendingMemory", JSON.stringify({ ...memory, audioUrl: data.audioUrl }));
    setBusy("");
  }

  async function save() {
    if (!memory) return;
    setBusy("save");
    await fetch("/api/save-memory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(memory),
    });
    setSaved(true);
    setBusy("");
  }

  function downloadKeepsake() {
    if (!memory) return;
    const blob = new Blob([JSON.stringify(memory, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${memory.title.toLowerCase().replaceAll(" ", "-")}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (!memory) {
    return (
      <>
        <Navbar />
        <main className="grid min-h-screen place-items-center bg-[#fffaf5] px-4 text-center">
          <div>
            <h1 className="text-3xl font-semibold text-stone-950">No memory card is open.</h1>
            <Link href="/start" className="mt-5 inline-flex rounded-full bg-rose-900 px-5 py-3 font-semibold text-white">Start a Memory</Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf5,#f5e5d8)] px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <MemoryCard
            memory={memory}
            actions={
              <div className="grid gap-3">
                <button onClick={translate} disabled={busy === "translate"} className="action-button"><Languages size={17} /> {busy === "translate" ? "Translating..." : "Translate"}</button>
                <button onClick={generateAudio} disabled={busy === "audio"} className="action-button"><Volume2 size={17} /> {busy === "audio" ? "Generating..." : "Generate audio"}</button>
                <button onClick={save} disabled={busy === "save"} className="action-button"><Save size={17} /> {saved ? "Saved" : busy === "save" ? "Saving..." : "Save memory"}</button>
                <button onClick={downloadKeepsake} className="action-button"><Download size={17} /> Download keepsake</button>
              </div>
            }
          />
        </div>
      </main>
    </>
  );
}
