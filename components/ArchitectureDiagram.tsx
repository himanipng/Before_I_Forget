import { Brain, Cloud, Database, FileAudio, GitBranch, Languages, Mic, Server, Volume2, Zap } from "lucide-react";

const nodes = [
  { title: "User starts a memory", detail: "Story, recipe, gratitude, or voice note", icon: Mic },
  { title: "Next.js frontend", detail: "Vercel UI only; no AWS secrets in browser", icon: Cloud },
  { title: "Secure API route", detail: "Server-side bridge signs AWS requests", icon: Server },
  { title: "Step Functions", detail: "Starts the Lambda chain for story processing", icon: GitBranch },
  { title: "Lambda: create session", detail: "Creates memory/session IDs and status", icon: Zap },
  { title: "Lambda: process story", detail: "Normalizes story text and metadata", icon: Zap },
  { title: "Lambda: transcript", detail: "Transcribe-ready voice-to-text boundary", icon: FileAudio },
  { title: "Lambda: translate", detail: "Translate-ready multilingual boundary", icon: Languages },
  { title: "Lambda: memory AI", detail: "Bedrock-powered keepsake generation", icon: Brain },
  { title: "Lambda: gratitude letter", detail: "Creates the emotional keepsake letter", icon: Zap },
  { title: "Lambda: save result", detail: "Writes final MemoryCard to DynamoDB", icon: Database },
  { title: "S3 + Polly ready", detail: "Presigned uploads and spoken letters", icon: Volume2 },
];

export function ArchitectureDiagram() {
  return (
    <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
      {nodes.map((node, index) => {
        const Icon = node.icon;
        return (
          <div key={node.title} className="relative rounded-3xl border border-stone-900/10 bg-white p-5 shadow-sm">
            {index < nodes.length - 1 ? (
              <span className="absolute -right-3 top-1/2 z-10 hidden size-6 -translate-y-1/2 place-items-center rounded-full bg-rose-900 text-xs font-bold text-white md:grid">
                →
              </span>
            ) : null}
            <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-rose-100 text-rose-950">
              <Icon />
            </div>
            <h3 className="text-lg font-semibold text-stone-950">{node.title}</h3>
            <p className="mt-2 text-sm leading-6 text-stone-600">{node.detail}</p>
          </div>
        );
      })}
    </div>
  );
}
