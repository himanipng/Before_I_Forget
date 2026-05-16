import type { MemoryCardData } from "@/lib/types";
import { BookOpen, Heart, MapPin, MessageCircle, Sparkles } from "lucide-react";

type Props = {
  memory: MemoryCardData;
  actions?: React.ReactNode;
};

export function MemoryCard({ memory, actions }: Props) {
  return (
    <article className="overflow-hidden rounded-[2rem] border border-rose-900/10 bg-white shadow-xl shadow-rose-950/8">
      <div className="bg-[linear-gradient(135deg,#5b1f22,#a55344_52%,#f0b36f)] p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full bg-white/16 px-3 py-1">{memory.relationship}</span>
          <span className="rounded-full bg-white/16 px-3 py-1">{memory.memoryType}</span>
          <span className="rounded-full bg-white/16 px-3 py-1">{memory.language}</span>
        </div>
        <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">{memory.title}</h1>
        <p className="mt-4 flex items-center gap-2 text-rose-50/85">
          <MapPin size={17} /> {memory.personName}{memory.country ? `, ${memory.country}` : ""}
        </p>
      </div>
      <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-5">
          <Block icon={<BookOpen size={18} />} label="Story summary">
            {memory.summary}
          </Block>
          <Block icon={<MessageCircle size={18} />} label="Original quote">
            <span className="text-xl font-medium leading-8 text-rose-950">“{memory.quote}”</span>
          </Block>
          <Block icon={<Sparkles size={18} />} label="Lesson passed down">
            {memory.lesson}
          </Block>
        </section>
        <aside className="space-y-5">
          <Block icon={<MapPin size={18} />} label="Cultural context">
            {memory.culturalContext}
          </Block>
          <Block icon={<MessageCircle size={18} />} label="Ask next">
            {memory.followUpQuestion}
          </Block>
          <Block icon={<Heart size={18} />} label="Gratitude letter">
            {memory.gratitudeLetter}
          </Block>
          {memory.translatedText ? (
            <Block icon={<Sparkles size={18} />} label="Translation">
              {memory.translatedText}
            </Block>
          ) : null}
          {memory.audioUrl ? (
            <div className="rounded-3xl bg-stone-950 p-4 text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-100/70">Audio keepsake</p>
              <p className="mt-2 text-sm text-rose-50/80">{memory.audioUrl}</p>
            </div>
          ) : null}
          {actions}
        </aside>
      </div>
    </article>
  );
}

function Block({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-[#fff8f1] p-5 ring-1 ring-stone-900/5">
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-rose-900">
        {icon} {label}
      </p>
      <div className="leading-8 text-stone-700">{children}</div>
    </div>
  );
}
