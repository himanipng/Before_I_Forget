"use client";

import { UploadCloud, Volume2 } from "lucide-react";

type UploadBoxProps = {
  fileName: string;
  onFileNameChange: (name: string) => void;
  onTranscribe: () => void;
  isBusy?: boolean;
};

export function UploadBox({ fileName, onFileNameChange, onTranscribe, isBusy }: UploadBoxProps) {
  return (
    <div className="rounded-3xl border border-dashed border-rose-900/25 bg-white/75 p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid size-12 place-items-center rounded-2xl bg-rose-100 text-rose-950">
            <UploadCloud />
          </span>
          <div>
            <p className="font-semibold text-stone-950">Voice note or photo</p>
            <p className="text-sm text-stone-600">Demo upload, ready for S3 storage later.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onTranscribe}
          disabled={isBusy}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Volume2 size={16} /> {isBusy ? "Transcribing..." : "Simulate transcription"}
        </button>
      </div>
      <input
        value={fileName}
        onChange={(event) => onFileNameChange(event.target.value)}
        className="mt-4 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-rose-600 focus:ring-4 focus:ring-rose-100"
        placeholder="nani-chai-story.m4a"
      />
    </div>
  );
}
