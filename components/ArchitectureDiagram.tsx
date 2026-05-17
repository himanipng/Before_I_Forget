import type { CSSProperties } from "react";
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

const desktopPlacement = [
  { row: 1, col: 1, connector: "→" },
  { row: 1, col: 2, connector: "→" },
  { row: 1, col: 3, connector: "→" },
  { row: 1, col: 4, connector: "↓" },
  { row: 2, col: 4, connector: "←" },
  { row: 2, col: 3, connector: "←" },
  { row: 2, col: 2, connector: "←" },
  { row: 2, col: 1, connector: "↓" },
  { row: 3, col: 1, connector: "→" },
  { row: 3, col: 2, connector: "→" },
  { row: 3, col: 3, connector: "→" },
  { row: 3, col: 4, connector: "" },
];

function connectorClass(connector: string) {
  if (connector === "↓") return "-bottom-4 left-1/2 -translate-x-1/2";
  if (connector === "←") return "-left-4 top-1/2 -translate-y-1/2";
  if (connector === "→") return "-right-4 top-1/2 -translate-y-1/2";
  return "";
}

export function ArchitectureDiagram() {
  return (
    <>
      <div className="grid gap-4 md:hidden">
        {nodes.map((node, index) => (
          <DiagramCard key={node.title} node={node} index={index} connector={index < nodes.length - 1 ? "↓" : ""} />
        ))}
      </div>

      <div className="hidden gap-5 md:grid md:grid-cols-4">
        {nodes.map((node, index) => {
          const placement = desktopPlacement[index];
          return (
            <DiagramCard
              key={node.title}
              node={node}
              index={index}
              connector={placement.connector}
              style={{ gridColumn: placement.col, gridRow: placement.row }}
            />
          );
        })}
      </div>
    </>
  );
}

function DiagramCard({
  node,
  index,
  connector,
  style,
}: {
  node: (typeof nodes)[number];
  index: number;
  connector: string;
  style?: CSSProperties;
}) {
  const Icon = node.icon;

  return (
    <div className="relative rounded-3xl border border-stone-900/10 bg-white p-5 shadow-sm" style={style}>
      {connector ? (
        <span className={`absolute z-10 grid size-7 place-items-center rounded-full bg-rose-900 text-sm font-bold text-white ${connectorClass(connector)}`}>
          {connector}
        </span>
      ) : null}
      <p className="mb-4 text-xs font-bold tracking-[0.18em] text-rose-900">
        {String(index + 1).padStart(2, "0")}
      </p>
      <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-rose-100 text-rose-950">
        <Icon />
      </div>
      <h3 className="text-lg font-semibold text-stone-950">{node.title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone-600">{node.detail}</p>
    </div>
  );
}
