import { ArchitectureDiagram } from "@/components/ArchitectureDiagram";
import { Navbar } from "@/components/Navbar";

const lambdaSteps = [
  ["createMemorySession", "Creates a session ID, createdAt timestamp, and first workflow status."],
  ["processStoryInput", "Cleans the story text and extracts basic story metadata."],
  ["generateTranscriptMock", "Mocks the Transcribe boundary so audio can become text later."],
  ["translateMemoryMock", "Mocks the Translate boundary for multilingual family access."],
  ["generateMemoryCardMock", "Creates the keepsake structure that Bedrock will later generate."],
  ["generateGratitudeLetterMock", "Turns the memory into a thank-you letter."],
  ["saveMemoryResult", "Writes the final MemoryCard-shaped item into DynamoDB."],
];

const implemented = [
  "Next.js API routes call AWS only from the server.",
  "Step Functions starts and observes the Lambda workflow.",
  "Seven Lambda functions form the story keepsake pipeline.",
  "DynamoDB stores generated memory results by memoryId.",
  "S3 presigned upload helper keeps media bytes out of Lambda.",
  "Mock AI is isolated so Bedrock can replace it later.",
];

export default function ArchitecturePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[linear-gradient(180deg,#fff8f1,#f4e7dd)] px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-900">Serverless With Lambda</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight text-stone-950 sm:text-6xl">
            Lambda is the heart of the memory pipeline.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-stone-700">
            Before I Forget uses the frontend only as the quiet entry point. The real backend shape is serverless:
            a secure Next.js API route starts Step Functions, Step Functions runs a chain of Lambda functions,
            and the final keepsake is stored in DynamoDB.
          </p>
          <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2rem] bg-rose-950 p-6 text-white shadow-xl shadow-rose-950/15">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-100">Live workflow ARN</p>
              <p className="mt-3 break-all font-mono text-sm leading-7 text-rose-50">
                arn:aws:states:us-west-2:085193942503:stateMachine:before-i-forget-memory-workflow
              </p>
            </div>
            <div className="rounded-[2rem] bg-white/90 p-6 shadow-sm ring-1 ring-stone-900/5">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-900">Judge takeaway</p>
              <p className="mt-3 leading-7 text-stone-700">
                This is not a static demo with AWS names pasted on top. The app is structured around Lambda boundaries
                that can run independently, scale to zero, and be swapped from mock AI to Bedrock without changing the UI.
              </p>
            </div>
          </div>
          <div className="mt-10">
            <ArchitectureDiagram />
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-stone-900/5">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-900">Seven Lambda functions</p>
              <div className="mt-5 grid gap-3">
                {lambdaSteps.map(([name, detail]) => (
                  <div key={name} className="rounded-2xl border border-stone-900/10 bg-[#fffaf5] p-4">
                    <p className="font-mono text-sm font-semibold text-stone-950">{name}</p>
                    <p className="mt-2 text-sm leading-6 text-stone-600">{detail}</p>
                  </div>
                ))}
              </div>
            </section>
            <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-stone-900/5">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-900">Implemented for MVP</p>
              <ul className="mt-5 grid gap-3">
                {implemented.map((item) => (
                  <li key={item} className="rounded-2xl bg-rose-50 px-4 py-3 text-sm leading-6 text-stone-700">
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-2xl bg-stone-950 p-5 text-white">
                <p className="text-lg leading-8">
                  Bedrock will replace the mock AI layer for interview generation, emotional summarization, and gratitude-letter generation.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
