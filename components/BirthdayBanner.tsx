"use client";

import { useState } from "react";
import Link from "next/link";

export function BirthdayBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="mx-auto mt-6 max-w-7xl px-4 sm:px-6">
      <div className="flex items-center justify-between rounded-2xl border border-[#DFD0C0] bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-2xl">🔔</span>
          <div>
            <p className="font-semibold text-stone-900">Nani&apos;s birthday — June 6</p>
            <p className="mt-0.5 text-sm text-stone-500">21 days away · 1 memory saved</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/start"
            className="rounded-full bg-[#881337] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4c0519]"
          >
            Add a memory →
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="text-stone-400 transition hover:text-stone-600"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
