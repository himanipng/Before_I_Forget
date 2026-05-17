import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { BirthdayBanner } from "@/components/BirthdayBanner";
import { ArchiveCard } from "@/components/ArchiveCard";
import type { ArchiveCardData } from "@/components/ArchiveCard";

const demoCards: ArchiveCardData[] = [
  {
    id: "1",
    gradient: "linear-gradient(160deg, #C8A882 0%, #7A5030 45%, #3E2010 100%)",
    category: "Recipe",
    occasionDate: "June 6",
    name: "Nani",
    relationship: "Grandmother",
    country: "India",
    title: "The Cardamom Chai That Cured Everything",
    themes: ["Her mornings", "The ritual she kept"],
    createdAt: "March 2024",
    photos: 3,
    audios: 1,
    href: "/start",
  },
  {
    id: "2",
    gradient: "linear-gradient(160deg, #B8C4BC 0%, #6A7E72 45%, #2E3E38 100%)",
    category: "Advice",
    occasionDate: "August 14",
    name: "Thatha",
    relationship: "Grandfather",
    country: "India",
    title: "He Never Learned English but Always Knew What to Say",
    themes: ["Roots I carry everywhere", "A roadmap I didn't know I needed"],
    createdAt: "November 2024",
    photos: 3,
    audios: 1,
    href: "/start",
  },
  {
    id: "3",
    gradient: "linear-gradient(160deg, #C4B090 0%, #7B5C38 45%, #3D2818 100%)",
    category: "Life Story",
    occasionDate: "Dec 15",
    name: "Amma",
    relationship: "Mother",
    country: "Sri Lanka",
    title: "The Village She Left Behind but Never Forgot",
    themes: ["What home means", "The price of leaving"],
    createdAt: "January 2025",
    photos: 2,
    audios: 1,
    href: "/start",
  },
  {
    id: "4",
    gradient: "linear-gradient(160deg, #D4C4A0 0%, #8B7248 45%, #453820 100%)",
    category: "Childhood Memory",
    occasionDate: "Oct 3",
    name: "Ajji",
    relationship: "Grandmother",
    country: "Karnataka",
    title: "The Mango Tree Was Her First Classroom",
    themes: ["Rooted in memory", "Joy found in simplicity"],
    createdAt: "February 2025",
    photos: 4,
    audios: 0,
    href: "/start",
  },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="pb-20">
        <BirthdayBanner />

        <section className="mx-auto mt-10 max-w-7xl px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-900">Archive</p>
          <h1
            className="mt-2 text-5xl leading-tight text-stone-900 sm:text-6xl"
            style={{ fontFamily: "var(--font-lora), Georgia, serif", fontStyle: "italic" }}
          >
            Gratitude, Preserved
          </h1>
          <p
            className="mt-2 text-[1.05rem] text-stone-500"
            style={{ fontFamily: "var(--font-lora), Georgia, serif", fontStyle: "italic" }}
          >
            Tap any memory to open it.
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {demoCards.map((card) => (
              <ArchiveCard key={card.id} card={card} />
            ))}
          </div>

          <div className="mt-10 flex items-center justify-between rounded-2xl border border-[#DFD0C0] bg-white/60 px-6 py-5">
            <div>
              <p className="font-semibold text-stone-900">Ready to preserve a voice?</p>
              <p className="mt-1 text-sm text-stone-500">A guided interview takes about 10 minutes.</p>
            </div>
            <Link
              href="/start"
              className="rounded-full bg-[#881337] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4c0519]"
            >
              Start a Memory
            </Link>
          </div>
        </section>

        <TechSection />
      </main>
    </>
  );
}

function TechSection() {
  return (
    <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-900">How It Works</p>
      <h2
        className="mt-2 max-w-2xl text-3xl leading-snug text-stone-900 sm:text-4xl"
        style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
      >
        A small ritual — from question to keepsake.
      </h2>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { step: "01", label: "Choose a person", body: "Start with Nani, a friend, a teacher — anyone whose voice matters." },
          { step: "02", label: "Interview gently", body: "AI generates questions shaped by relationship, culture, and goal." },
          { step: "03", label: "Preserve across language", body: "AWS Translate carries the story across any language barrier." },
          { step: "04", label: "Save the memory", body: "Audio via Polly, text via DynamoDB, files via S3 — all serverless." },
        ].map(({ step, label, body }) => (
          <div key={step} className="rounded-2xl border border-[#DFD0C0] bg-white/70 p-5">
            <p className="text-xs font-bold tracking-widest text-rose-900">{step}</p>
            <p className="mt-2 font-semibold text-stone-900">{label}</p>
            <p className="mt-2 text-sm leading-6 text-stone-500">{body}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl bg-stone-950 px-6 py-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">AWS Services</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {["S3", "Step Functions", "Transcribe", "Translate", "Polly", "DynamoDB", "Lambda", "Bedrock"].map((s) => (
            <span key={s} className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white ring-1 ring-white/10">
              {s}
            </span>
          ))}
        </div>
        <Link href="/architecture" className="mt-4 inline-block text-sm font-medium text-stone-400 underline underline-offset-4 transition hover:text-white">
          See full architecture diagram →
        </Link>
      </div>
    </section>
  );
}
