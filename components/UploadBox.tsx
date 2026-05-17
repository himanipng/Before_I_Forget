"use client";

import { useRef, useState } from "react";
import { Mic, Square, UploadCloud, Volume2 } from "lucide-react";
import { getUploadUrl } from "@/lib/api";

type UploadBoxProps = {
  fileName: string;
  fileKey?: string;
  onFileNameChange: (name: string) => void;
  onFileKeyChange?: (key: string) => void;
  onTranscribe: () => void;
  isBusy?: boolean;
  labels?: Partial<UploadBoxLabels>;
};

type UploadBoxLabels = {
  title: string;
  description: string;
  uploadAudio: string;
  record: string;
  stop: string;
  uploadFirst: string;
  startTranscribe: string;
  transcribing: string;
  unsupportedRecording: string;
  preparingUpload: string;
  staged: string;
  recording: string;
};

const defaultLabels: UploadBoxLabels = {
  title: "Voice note or phone-call audio",
  description: "Record in-browser or upload a forwarded call file, then send it to Transcribe.",
  uploadAudio: "Upload audio",
  record: "Record",
  stop: "Stop",
  uploadFirst: "Upload first",
  startTranscribe: "Start Transcribe",
  transcribing: "Transcribing...",
  unsupportedRecording: "This browser does not support in-browser recording. Upload an audio file instead.",
  preparingUpload: "Preparing secure S3 upload...",
  staged: "Audio is staged for Amazon Transcribe.",
  recording: "Recording. Ask the question out loud, or capture a short call excerpt with permission.",
};

function recordingMimeType() {
  const options = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
  return options.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

function extensionForMimeType(type: string) {
  if (type.includes("mp4")) return "m4a";
  if (type.includes("ogg")) return "ogg";
  return "webm";
}

export function UploadBox({ fileName, fileKey, onFileNameChange, onFileKeyChange, onTranscribe, isBusy, labels }: UploadBoxProps) {
  const text = { ...defaultLabels, ...(labels || {}) };
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [message, setMessage] = useState("");

  async function uploadBlob(blob: Blob, name: string) {
    setUploading(true);
    setMessage(text.preparingUpload);
    onFileKeyChange?.("");

    try {
      const { uploadUrl, fileKey: nextFileKey } = await getUploadUrl(name, blob.type || "audio/webm");

      if (!uploadUrl.includes("mock-upload.before-i-forget.local")) {
        await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": blob.type || "audio/webm" },
          body: blob,
        });
      }

      onFileNameChange(name);
      onFileKeyChange?.(nextFileKey);
      setMessage(text.staged);
    } catch (error) {
      setMessage(error instanceof Error ? `Upload failed: ${error.message}` : "Upload failed. Unable to stage audio for Transcribe.");
    } finally {
      setUploading(false);
    }
  }

  async function selectFile(file: File | null) {
    if (!file) return;
    await uploadBlob(file, file.name);
  }

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMessage(text.unsupportedRecording);
      return;
    }

    if (typeof MediaRecorder === "undefined") {
      setMessage(text.unsupportedRecording);
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      setMessage(error instanceof Error ? `Recording failed: ${error.message}` : "Recording failed. Check microphone permission and try again.");
      return;
    }

    const mimeType = recordingMimeType();
    let recorder: MediaRecorder;
    try {
      recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    } catch (error) {
      stream.getTracks().forEach((track) => track.stop());
      setMessage(error instanceof Error ? `Recording failed: ${error.message}` : "Recording failed. Upload an audio file instead.");
      return;
    }
    chunksRef.current = [];
    recorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = async () => {
      stream.getTracks().forEach((track) => track.stop());
      const type = recorder.mimeType || mimeType || "audio/webm";
      const blob = new Blob(chunksRef.current, { type });
      await uploadBlob(blob, `recorded-memory-${Date.now()}.${extensionForMimeType(type)}`);
    };

    recorder.start();
    setRecording(true);
    setMessage(text.recording);
  }

  function stopRecording() {
    recorderRef.current?.stop();
    setRecording(false);
  }

  return (
    <div className="rounded-3xl border border-dashed border-rose-900/25 bg-white/75 p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid size-12 place-items-center rounded-2xl bg-rose-100 text-rose-950">
            <UploadCloud />
          </span>
          <div>
            <p className="font-semibold text-stone-950">{text.title}</p>
            <p className="text-sm text-stone-600">{text.description}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-950 ring-1 ring-stone-200 transition hover:bg-stone-50">
            <UploadCloud size={16} /> {text.uploadAudio}
            <input type="file" accept="audio/*,video/mp4" className="sr-only" onChange={(event) => selectFile(event.target.files?.[0] || null)} />
          </label>
          <button
            type="button"
            onClick={recording ? stopRecording : startRecording}
            disabled={uploading || isBusy}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {recording ? <Square size={16} /> : <Mic size={16} />} {recording ? text.stop : text.record}
          </button>
          <button
            type="button"
            onClick={onTranscribe}
            disabled={isBusy || uploading || !fileKey}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-950 ring-1 ring-rose-900/15 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Volume2 size={16} /> {isBusy ? text.transcribing : fileKey ? text.startTranscribe : text.uploadFirst}
          </button>
        </div>
      </div>
      <input
        value={fileName}
        onChange={(event) => onFileNameChange(event.target.value)}
        className="mt-4 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-rose-600 focus:ring-4 focus:ring-rose-100"
        placeholder="family-voice-note.m4a"
      />
      {fileKey ? <p className="mt-3 break-all text-xs font-medium text-stone-500">S3 key: {fileKey}</p> : null}
      {message ? <p className="mt-3 text-sm font-medium text-rose-900">{message}</p> : null}
    </div>
  );
}
