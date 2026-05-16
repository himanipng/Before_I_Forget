# Before I Forget

Before I Forget is an emotional memory-preservation app for immigrant families, overseas friends, and loved ones separated across countries. It helps people preserve voices, recipes, advice, gratitude letters, and family stories before those memories are lost.

Theme connection: **Build with Gratitude**. The product is built around saying thank you while people can still hear it.

## Why This Matters

Many families carry their most important history in voice notes, recipes, repeated phrases, and small routines. For immigrant and overseas families, distance makes those memories easier to postpone and easier to lose. Before I Forget turns a gentle interview into a keepsake memory card with a story summary, quote, lesson, cultural context, follow-up question, gratitude letter, translation, and mock spoken audio.

## AWS Services Prepared

- **Amazon S3**: upload-ready storage layer for audio, photos, and keepsake files.
- **Amazon Transcribe**: SDK-ready voice-to-text integration, mocked for local demo.
- **Amazon Translate**: route contract and SDK-ready translation helper, mocked for local demo.
- **Amazon Polly**: route contract and SDK-ready speech synthesis helper, mocked for local demo.
- **DynamoDB-style storage**: clean storage abstraction for memory cards and sessions, backed by local JSON for demo.
- **API Gateway/Lambda style**: each `app/api/*/route.ts` is structured as a serverless handler boundary.
- **Cognito-ready auth placeholder**: the demo does not require login, but the data model is ready for user/session ownership.

## Bedrock Later

Amazon Bedrock will replace the local mock AI layer in `lib/mockAI.ts` for:

- Interview question generation
- Emotional summarization
- Lesson and cultural context extraction
- Gratitude-letter generation

The UI and API contracts are already separated so Bedrock can be added without redesigning the demo flow.

## Local Setup

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` when connecting real AWS services.

## Judge Demo Script

1. Start a memory for “Nani”
2. Choose grandmother, India, Hindi, recipe
3. Generate interview questions
4. Enter a short story about chai
5. Generate memory card
6. Show gratitude letter
7. Show architecture page
8. Explain that Bedrock replaces the mock emotional AI layer

## API Routes

- `POST /api/start-interview`
- `POST /api/transcribe`
- `POST /api/translate`
- `POST /api/generate-memory-card`
- `POST /api/polly`
- `POST /api/save-memory`
- `GET /api/memories`

## Future Improvements

- Add Cognito authentication and per-family archives.
- Store uploaded media in S3 with signed upload URLs.
- Persist memory cards in DynamoDB.
- Replace mock AI with Bedrock prompts and guardrails.
- Add real Transcribe job polling and transcript correction.
- Generate shareable PDF/audio keepsake bundles.
- Add family collaboration and multilingual review flows.
