import { ArchitectureDiagram } from "@/components/ArchitectureDiagram";
import { Navbar } from "@/components/Navbar";

export default function ArchitecturePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[linear-gradient(180deg,#fff8f1,#f4e7dd)] px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-900">AWS Architecture</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight text-stone-950 sm:text-6xl">
            A Lambda-style memory pipeline, mocked where it should be mocked.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-stone-700">
            The demo runs locally, but the boundaries match AWS services: S3 for files, Transcribe for voice, Translate for language, Polly for spoken letters, and DynamoDB-style storage for cards and sessions.
          </p>
          <div className="mt-10">
            <ArchitectureDiagram />
          </div>
          <div className="mt-8 rounded-[2rem] bg-stone-950 p-6 text-white shadow-xl shadow-stone-950/10">
            <p className="text-lg leading-8">
              Bedrock will replace the mock AI layer for interview generation, emotional summarization, and gratitude-letter generation.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
