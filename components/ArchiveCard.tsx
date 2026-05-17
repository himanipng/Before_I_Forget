import Link from "next/link";

export type ArchiveCardData = {
  id: string;
  gradient: string;
  category: string;
  occasionDate: string;
  name: string;
  relationship: string;
  country: string;
  title: string;
  themes: string[];
  createdAt: string;
  photos: number;
  audios: number;
  href: string;
};

export function ArchiveCard({ card }: { card: ArchiveCardData }) {
  return (
    <Link href={card.href} className="group block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#E0D4C8] transition hover:-translate-y-0.5 hover:shadow-md">
      <div
        className="relative h-52 w-full"
        style={{ background: card.gradient }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-stone-800 backdrop-blur-sm">
            {card.category}
          </span>
          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-stone-800 backdrop-blur-sm">
            🤲 {card.occasionDate}
          </span>
        </div>
      </div>

      <div className="p-5">
        <p className="text-[1.15rem] font-semibold text-stone-900">{card.name}</p>
        <p className="mt-0.5 text-sm text-stone-500">{card.relationship} · {card.country}</p>

        <p className="mt-3 text-[0.95rem] font-semibold leading-snug text-stone-800">
          {card.title}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {card.themes.map((theme) => (
            <span
              key={theme}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#DFD0C0] bg-[#FDF4E7] px-3 py-1 text-xs font-medium text-[#7B5533]"
            >
              💛 {theme}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-stone-400">{card.createdAt}</p>
          <div className="flex items-center gap-3 text-xs text-stone-400">
            <span>📷 {card.photos}</span>
            <span>🎵 {card.audios}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
