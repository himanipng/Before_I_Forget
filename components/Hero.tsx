import Link from "next/link";
import { ArrowRight, CheckCircle2, Cloud, Database, GitBranch, Mic, Sparkles } from "lucide-react";

const pipeline = [
  ["Input", "Nani, India, Hindi recipe memory"],
  ["Step Functions", "Seven Lambda workflow starts"],
  ["DynamoDB", "Memory card saved and archive-ready"],
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#fff8f1_0%,#f5e5d8_72%,#fffaf5_100%)]">
      <div className="mx-auto grid min-h-[calc(100vh-65px)] max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative z-10 max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-rose-900/10 bg-white/65 px-4 py-2 text-sm font-medium text-rose-950 shadow-sm">
            <Sparkles size={16} /> Demo-ready AWS memory workflow
          </div>
          <h1 className="max-w-4xl text-5xl font-semibold leading-[0.98] tracking-normal text-stone-950 sm:text-7xl">
            Before I Forget
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-700 sm:text-xl">
            A focused demo for preserving family stories: enter one memory, start the serverless workflow, and open a saved keepsake card from the archive.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/start"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-900 px-6 py-3 font-semibold text-white shadow-lg shadow-rose-950/15 transition hover:bg-rose-950"
            >
              Run the judge demo <ArrowRight size={18} />
            </Link>
            <Link
              href="/archive"
              className="inline-flex items-center justify-center rounded-full border border-stone-900/10 bg-white/70 px-6 py-3 font-semibold text-stone-800 shadow-sm transition hover:bg-white"
            >
              View saved memories
            </Link>
          </div>
          <div className="mt-8 grid gap-3 text-sm text-stone-700 sm:grid-cols-3">
            {["Works with Vercel env vars", "Falls back to mock mode", "Archive reads saved cards"].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-2xl bg-white/70 px-4 py-3 ring-1 ring-stone-900/5">
                <CheckCircle2 size={17} className="text-rose-900" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 mx-auto w-full max-w-xl">
          <div className="overflow-hidden rounded-[2rem] bg-stone-950 text-white shadow-2xl shadow-rose-950/15">
            <div className="border-b border-white/10 bg-white/8 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-100/70">Live demo flow</p>
                <h2 className="mt-1 text-2xl font-semibold">Nani&apos;s chai memory</h2>
                </div>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-semibold text-emerald-100">Ready</span>
              </div>
            </div>
            <div className="grid gap-4 p-5">
              {pipeline.map(([title, detail], index) => (
                <div key={title} className="grid grid-cols-[2.25rem_1fr] gap-3">
                  <div className="grid size-9 place-items-center rounded-full bg-rose-100 text-rose-950">
                    {index === 0 ? <Mic size={17} /> : index === 1 ? <GitBranch size={17} /> : <Database size={17} />}
                  </div>
                  <div className="rounded-2xl bg-white/8 p-4 ring-1 ring-white/10">
                    <p className="font-semibold">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-rose-50/75">{detail}</p>
                  </div>
                </div>
              ))}
              <div className="rounded-2xl bg-[#fff8f1] p-5 text-stone-950">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-900">Output preview</p>
                <h3 className="mt-3 text-2xl font-semibold">The Mornings She Made Warm</h3>
                <p className="mt-3 leading-7 text-stone-700">&ldquo;She made chai every morning before school.&rdquo;</p>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 p-4">
                <Cloud size={19} className="text-rose-100" />
                <div>
                  <p className="font-semibold">AWS path is visible</p>
                  <p className="text-sm text-rose-50/70">S3, Transcribe, Translate, Step Functions, Lambda, DynamoDB</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
