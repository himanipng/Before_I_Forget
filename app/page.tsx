import Link from "next/link";
import { ArrowRight, Archive, Cloud, Languages, Mic, NotebookPen, PlayCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Hero } from "@/components/Hero";
import { MemoryCard } from "@/components/MemoryCard";
import { Navbar } from "@/components/Navbar";
import type { MemoryCardData } from "@/lib/types";

const previewMemory: MemoryCardData = {
  id: "preview",
  memoryId: "preview",
  personName: "Nani",
  relationship: "grandparent",
  country: "India",
  language: "Hindi",
  memoryType: "recipe",
  title: "The Mornings She Made Warm",
  summary:
    "Every morning, she made chai before school, not just as a drink, but as a quiet way of saying you were cared for.",
  quote: "She made chai every morning before school.",
  lesson: "Care is often shown through small routines.",
  culturalContext:
    "In many Indian families, chai is a morning rhythm, a welcome, and a way of carrying tenderness across generations.",
  followUpQuestion: "What spice made her chai taste like hers?",
  gratitudeLetter:
    "I do not think I realized back then how much those mornings meant. Thank you for every cup and every quiet way you loved us.",
  createdAt: new Date().toISOString(),
  status: "MOCK",
};

const judgePath: Array<[LucideIcon, string, string]> = [
  [PlayCircle, "Start Memory", "Use the prefilled Nani story and run the workflow without setup."],
  [Archive, "Open Archive", "Confirm the saved card appears from the backend storage path."],
  [Cloud, "Show AWS", "Point to the serverless workflow and Lambda responsibilities."],
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Section eyebrow="Judge path" title="Three clicks show the whole project.">
          <div className="grid gap-4 md:grid-cols-3">
            {judgePath.map(([Icon, title, body]) => (
              <div key={title} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-900/5">
                <Icon className="mb-5 text-rose-900" />
                <h3 className="text-xl font-semibold text-stone-950">{title}</h3>
                <p className="mt-3 leading-7 text-stone-600">{body}</p>
              </div>
            ))}
          </div>
        </Section>
        <Section eyebrow="What the demo proves" title="One story moves through the full keepsake pipeline.">
          <div className="grid gap-4 md:grid-cols-4">
            {([
              [NotebookPen, "Prefilled story input", "A realistic family memory is ready so the judge can run it immediately."],
              [Mic, "Audio-ready branch", "Upload and Transcribe controls are visible without blocking the core demo."],
              [Languages, "Translation path", "AWS Translate is connected with a mock fallback for reliability."],
              [Cloud, "Saved result", "The generated card is written through the storage abstraction and opened instantly."],
            ] as [LucideIcon, string, string][]).map(([Icon, title, body]) => (
              <div key={title} className="rounded-3xl border border-rose-900/10 bg-[#fff8f1] p-6">
                <Icon className="mb-5 text-rose-900" />
                <h3 className="font-semibold text-stone-950">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-stone-600">{body}</p>
              </div>
            ))}
          </div>
        </Section>
        <Section eyebrow="AWS proof points" title="The frontend stays simple because the workflow is serverless.">
          <div className="rounded-[2rem] bg-stone-950 p-6 text-white shadow-xl shadow-stone-950/10 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {["S3 uploads", "Transcribe", "Translate", "Step Functions", "DynamoDB"].map((service) => (
                <div key={service} className="rounded-2xl bg-white/8 p-4 ring-1 ring-white/10">
                  <p className="font-semibold">{service}</p>
                  <p className="mt-2 text-sm leading-6 text-stone-300">SDK v3-ready integration point.</p>
                </div>
              ))}
            </div>
          </div>
        </Section>
        <Section eyebrow="Demo memory card preview" title="The output feels personal, not generated.">
          <MemoryCard memory={previewMemory} />
          <div className="mt-8 text-center">
            <Link
              href="/start"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-900 px-6 py-3 font-semibold text-white shadow-lg shadow-rose-950/15 hover:bg-rose-950"
            >
              Start a Memory <ArrowRight size={18} />
            </Link>
          </div>
        </Section>
      </main>
    </>
  );
}

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-900">{eyebrow}</p>
      <h2 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight text-stone-950 sm:text-5xl">{title}</h2>
      <div className="mt-8">{children}</div>
    </section>
  );
}
