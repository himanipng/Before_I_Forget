import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#E0D4C8] bg-[#F5EDE4]/92 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="text-[1.1rem] font-semibold tracking-tight text-stone-900">
          Before I{" "}
          <span className="text-rose-900">Forget</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/archive"
            className="rounded-full border border-[#D4C4B4] bg-white/60 px-4 py-1.5 text-sm font-medium text-stone-700 transition hover:bg-white"
          >
            Archive
          </Link>
          <Link
            href="/architecture"
            className="rounded-full border border-[#D4C4B4] bg-white/60 px-4 py-1.5 text-sm font-medium text-stone-700 transition hover:bg-white"
          >
            How It Works
          </Link>
          <Link
            href="/start"
            className="flex items-center gap-1.5 rounded-full border border-[#D4AE80] bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-900 transition hover:bg-amber-100"
          >
            🔔 Nani&apos;s birthday — 21d
          </Link>
          <Link
            href="/start"
            className="rounded-full bg-[#881337] px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-[#4c0519]"
          >
            + New Memory
          </Link>
        </div>
      </nav>
    </header>
  );
}
