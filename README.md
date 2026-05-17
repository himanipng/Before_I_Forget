# Before I Forget

Before I Forget is an emotional memory-preservation app for immigrant families, overseas friends, elders, and loved ones separated across countries. It helps people preserve voices, photos, recipes, advice, gratitude letters, and family stories before those memories are lost.

Theme connection: **Build with Gratitude**. The product is built around saying thank you while people can still hear it.

## Why This Matters

Many families carry their most important history in voice notes, recipes, repeated phrases, photos, and small routines. For immigrant and overseas families, distance makes those memories easier to postpone and easier to lose. Before I Forget turns a gentle interview into a keepsake memory card with a story summary, quote, lesson, cultural context, follow-up question, gratitude letter, translation, and mock spoken audio. The app also groups memories by person so families can visit Nani, Safia, a friend, or an elder as a living profile instead of searching through loose files.

## AWS Services Prepared

- **Amazon S3**: upload-ready storage layer for audio, photos, and keepsake files.
- **Amazon Transcribe**: AWS-backed voice-to-text for uploaded recordings, with mock fallback for demo safety.
- **Amazon Translate**: AWS-backed translation helper for multilingual keepsakes and page text experiments, with mock fallback.
- **Amazon Bedrock Claude**: real Claude invocation path for interview questions and memory-card generation, with mock fallback.
- **Amazon Polly**: route contract and SDK-ready speech synthesis helper, mocked for local demo.
- **DynamoDB storage**: clean storage abstraction for memory cards and sessions, backed by DynamoDB when AWS env vars exist and local JSON/mock mode for safe demos.
- **DynamoDB profile storage**: person profiles, uploaded profile photos, and profile-linked memories for the People page.
- **API Gateway/Lambda style**: each `app/api/*/route.ts` is structured as a serverless handler boundary.
- **Cognito-ready auth placeholder**: the demo does not require login, but the data model is ready for user/session ownership.

## Serverless With Lambda Focus

The judging story is Lambda-first: the frontend starts a secure server-side request, Step Functions orchestrates the workflow, and seven Lambda functions transform a raw family memory into a saved keepsake.

Live Step Functions ARN:

```text
arn:aws:states:us-west-2:085193942503:stateMachine:before-i-forget-memory-workflow
```

Lambda functions in `aws-workflow/lambdas/`:

- `createMemorySession`
- `processStoryInput`
- `generateTranscriptMock`
- `translateMemoryMock`
- `generateMemoryCardMock`
- `generateGratitudeLetterMock`
- `saveMemoryResult`

The final Lambda writes a MemoryCard-shaped result to DynamoDB. The Next.js `/api/workflow-status` route reads Step Functions completion and the Start Memory page opens the finished card when the workflow succeeds.

## Bedrock Claude Integration

Amazon Bedrock now replaces the local mock AI layer when AWS credentials and model access are configured. The app uses `@aws-sdk/client-bedrock-runtime` and the Anthropic Claude Messages payload through `InvokeModelCommand`.

Bedrock-backed paths:

- `POST /api/start-interview` for interview question generation
- `POST /api/generate-memory-card` for emotional summarization, lesson and cultural context extraction, and gratitude-letter generation
- `POST /api/start-memory` for the one-click demo memory card

If Bedrock is not configured, model access is not enabled, or the model call fails, the app falls back to the mock AI response so the demo keeps working.

## Product Flows

- **Start Memory**: a guided family-side workflow with browser recording/upload, Amazon Transcribe, Bedrock-backed memory generation, Step Functions polling, and DynamoDB save.
- **People**: profile-first archive where each person can have a relationship, country, language, notes, uploaded photos, and attached memories. Memories attach through `personId` when started from a profile and also fall back to matching by person name for older demo cards.
- **Archive**: cross-person memory view with filters. Cards use each person profile's first uploaded photo as the visual header when available.
- **Elder Mode**: simplified elder-facing page at `/elder` with large text, recording/upload, one big save action, and page-level UI translation for English, Hindi, Spanish, Mandarin, Arabic, Tagalog, Vietnamese, and French.
- **Architecture**: Lambda-centered snake-flow diagram showing the secure Next.js bridge, Step Functions, Lambda chain, S3, Transcribe, Translate, Bedrock, Polly, and DynamoDB.

## Local Setup

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` when connecting real AWS services.

## Judge Demo Script

1. Open People and show that memories are organized by person.
2. Create or open the “Nani” profile and upload a profile photo.
3. Start a memory from Nani's profile so the memory attaches to her.
4. Choose grandmother, India, Hindi, recipe.
5. Record/upload audio or enter a short story about chai.
6. Generate the memory card and show the gratitude letter.
7. Open Archive and point out the profile photo on the saved memory card.
8. Open Elder Mode and switch the page language to Hindi, Spanish, Mandarin, Arabic, Tagalog, Vietnamese, or French.
9. Show the architecture page and the Lambda-centered snake workflow.
10. Open `aws-workflow/` and point to the seven Lambda functions.
11. Explain that Bedrock powers the emotional AI layer with a mock fallback for demo safety.

## API Routes

- `POST /api/start-memory`
- `POST /api/start-interview`
- `POST /api/transcribe`
- `POST /api/translate`
- `POST /api/generate-memory-card`
- `POST /api/polly`
- `POST /api/save-memory`
- `GET /api/memories`
- `GET /api/memories/[id]`
- `GET /api/profiles`
- `POST /api/profiles`
- `PATCH /api/profiles/[id]`
- `POST /api/profiles/[id]/photos`
- `POST /api/upload-url`
- `GET /api/photo-url`
- `GET /api/workflow-status`

## Integration Status

- [x] Merge Person 2 backend bridge into `main`.
- [x] Merge Person 1 AWS workflow into `main`.
- [x] Keep the Next.js app functional after both merges.
- [x] Start Step Functions executions from server-side Next.js API routes.
- [x] Poll Step Functions status from the Start Memory flow and open the finished card when ready.
- [x] Store memory cards through DynamoDB when AWS env vars are configured.
- [x] Generate S3 presigned upload URLs without exposing AWS secrets to the browser.
- [x] Preserve local mock mode when AWS env vars are missing.
- [x] Add SAM workflow files under `aws-workflow/`.
- [x] Make the workflow `saveMemoryResult` Lambda persist MemoryCard-shaped results to DynamoDB.
- [x] Add AWS Translate-backed `/api/translate` with mock fallback.
- [x] Add AWS Transcribe-backed `/api/transcribe` for S3 audio files with mock fallback.
- [x] Add browser recording/upload UI for voice notes and forwarded phone-call audio.
- [x] Add Bedrock Claude-backed memory generation with mock fallback.
- [x] Add profile-first People page with person profiles.
- [x] Attach new memories to person profiles through `personId`.
- [x] Add profile photo uploads through S3 presigned URLs.
- [x] Show profile photos on People and Archive cards.
- [x] Add simplified Elder Mode with page-level language switching.
- [ ] Add real media tabs for photos, audio, and video.
- [ ] Add Cognito authentication.
- [ ] Add production-grade media processing for thumbnails, transcripts, and video.

## Person 2 Backend Integration

This branch adds the secure API/data bridge for the Serverless with Lambda track.

- Vercel hosts the Next.js frontend.
- Next.js API routes in `app/api` act as the secure server-side bridge between the frontend and AWS.
- AWS credentials are read only from server-side environment variables. They are never placed in client components and are never prefixed with `NEXT_PUBLIC_`.
- DynamoDB stores generated memory cards with `memoryId` as the primary key.
- DynamoDB also stores person profile metadata for the People page.
- S3 stores uploaded audio, profile photos, and memory files through server-generated presigned upload URLs.
- Step Functions starts Person 1's Lambda workflow through `StartExecutionCommand`.
- `GET /api/workflow-status` can read workflow state through `DescribeExecutionCommand`.
- If AWS environment variables are missing, the app automatically runs in mock mode so the hackathon demo remains safe and reliable.

Required Vercel environment variables:

```bash
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=before-i-forget-uploads
DYNAMODB_TABLE_NAME=BeforeIForgetMemories
STEP_FUNCTION_ARN=
BEDROCK_MODEL_ID=us.anthropic.claude-haiku-4-5-20251001-v1:0
NEXT_PUBLIC_API_BASE_URL=
```

`NEXT_PUBLIC_API_BASE_URL` is optional. Keep all AWS variables server-only.

To provision the AWS resources from an authenticated AWS CloudShell session:

```bash
./scripts/provision-aws.sh
```

The script creates/verifies:

- DynamoDB table `BeforeIForgetMemories` with `memoryId` as the partition key
- Private S3 upload bucket
- IAM user `before-i-forget-vercel-api` with scoped DynamoDB, S3, and Step Functions permissions
- One access key pair to paste into Vercel environment variables

If Vercel can start a workflow but cannot poll it, rerun the provisioner in AWS CloudShell. Step Functions uses two resource types: `states:StartExecution` applies to the state machine ARN, while `states:DescribeExecution` applies to execution ARNs such as:

```text
arn:aws:states:us-west-2:085193942503:execution:before-i-forget-memory-workflow:*
```

## Future Improvements

- Add Cognito authentication and per-family archives.
- Expand uploaded media flows into full photo/audio/video tabs under each person.
- Add richer Bedrock prompt evaluation, guardrails, and model-selection controls.
- Add transcript correction and richer async status UI for longer Transcribe jobs.
- Add photo and video thumbnail generation Lambdas.
- Generate shareable PDF/audio keepsake bundles.
- Add family collaboration and multilingual review flows beyond the Elder Mode page-language switcher.
