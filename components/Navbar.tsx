import Link from "next/link";
import { HeartHandshake } from "lucide-react";

const links = [
  { href: "/start", label: "Start" },
  { href: "/archive", label: "Archive" },
  { href: "/architecture", label: "AWS" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-rose-900/10 bg-[#fffaf5]/85 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-stone-950">
          <span className="grid size-9 place-items-center rounded-full bg-rose-900 text-rose-50 shadow-sm">
            <HeartHandshake size={18} />
          </span>
          <span>Before I Forget</span>
        </Link>
        <div className="flex items-center gap-1 rounded-full bg-white/70 p-1 shadow-sm ring-1 ring-stone-900/5">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-rose-50 hover:text-rose-900"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
