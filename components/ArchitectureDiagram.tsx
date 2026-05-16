import { Brain, Cloud, Database, FileAudio, Languages, Mic, Server, Volume2 } from "lucide-react";

const nodes = [
  { title: "User uploads voice/photo", detail: "Family story, recipe, letter", icon: Mic },
  { title: "Next.js frontend", detail: "App Router demo flow", icon: Cloud },
  { title: "API route / Lambda handler", detail: "Serverless contracts", icon: Server },
  { title: "S3 stores file", detail: "Audio and keepsake media", icon: FileAudio },
  { title: "Transcribe creates transcript", detail: "Voice story to text", icon: FileAudio },
  { title: "Translate converts language", detail: "Cross-language access", icon: Languages },
  { title: "Mock AI memory layer", detail: "Later: Amazon Bedrock", icon: Brain },
  { title: "Polly creates audio letter", detail: "Spoken gratitude", icon: Volume2 },
  { title: "DynamoDB stores metadata", detail: "Memory cards and sessions", icon: Database },
];

export function ArchitectureDiagram() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
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
