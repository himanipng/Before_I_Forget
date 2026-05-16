import Link from "next/link";
import { ArrowRight, Mic, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_20%_20%,#fde2d5_0,#fff8f1_32%,#f7efe7_72%,#f4e7dd_100%)]">
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#fffaf5] to-transparent" />
      <div className="mx-auto grid min-h-[86vh] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative z-10 max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-rose-900/10 bg-white/65 px-4 py-2 text-sm font-medium text-rose-950 shadow-sm">
            <Sparkles size={16} /> Build with Gratitude
          </div>
          <h1 className="max-w-4xl text-5xl font-semibold leading-[0.98] tracking-normal text-stone-950 sm:text-7xl">
            Ask before it becomes impossible.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-700 sm:text-xl">
            Before I Forget helps families preserve voices, stories, recipes, and gratitude across distance.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/start"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-900 px-6 py-3 font-semibold text-white shadow-lg shadow-rose-950/15 transition hover:bg-rose-950"
            >
              Start a Memory <ArrowRight size={18} />
            </Link>
            <Link
              href="/architecture"
              className="inline-flex items-center justify-center rounded-full border border-stone-900/10 bg-white/70 px-6 py-3 font-semibold text-stone-800 shadow-sm transition hover:bg-white"
            >
              View AWS build
            </Link>
          </div>
        </div>
        <div className="relative z-10 mx-auto w-full max-w-xl">
          <div className="relative rounded-[2rem] border border-white/70 bg-white/65 p-4 shadow-2xl shadow-rose-950/10 backdrop-blur">
            <div className="overflow-hidden rounded-[1.5rem] bg-[#201713] text-rose-50">
              <div className="h-56 bg-[linear-gradient(135deg,rgba(255,214,186,.9),rgba(136,57,45,.88)),url('/window.svg')] bg-cover bg-center p-6">
                <div className="flex h-full flex-col justify-between">
                  <span className="w-fit rounded-full bg-white/20 px-3 py-1 text-sm backdrop-blur">Nani, India</span>
                  <div>
                    <p className="text-sm uppercase tracking-[0.22em] text-rose-100/80">memory preview</p>
                    <h2 className="mt-2 text-3xl font-semibold">The Mornings She Made Warm</h2>
                  </div>
                </div>
              </div>
              <div className="space-y-5 p-6">
                <p className="text-lg leading-8 text-rose-50/90">
                  “She made chai every morning before school.”
                </p>
                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-full bg-rose-100 text-rose-950">
                      <Mic size={18} />
                    </span>
                    <div>
                      <p className="font-medium">Audio keepsake ready</p>
                      <p className="text-sm text-rose-100/70">Mock Polly voice letter</p>
                    </div>
                  </div>
                  <div className="flex items-end gap-1">
                    {Array.from({ length: 24 }).map((_, index) => (
                      <span
                        key={index}
                        className="w-full rounded-full bg-rose-100/80"
                        style={{ height: `${12 + ((index * 17) % 38)}px` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
