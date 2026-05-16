# Before I Forget AWS Workflow

This folder contains the Lambda-centered AWS SAM backend for the Before I Forget hackathon project. It uses AWS Step Functions to orchestrate Lambda steps for turning a personal story into a transcript, translation, memory card, and gratitude letter.

No Bedrock or external AI service is used. All AI-like outputs are deterministic mock responses.

## Workflow

The Step Functions state machine runs these Lambda functions in order:

1. `createMemorySession`
2. `processStoryInput`
3. `generateTranscriptMock`
4. `translateMemoryMock`
5. `generateMemoryCardMock`
6. `generateGratitudeLetterMock`
7. `saveMemoryResult`

Live Step Functions ARN used by the Vercel app:

```text
arn:aws:states:us-west-2:085193942503:stateMachine:before-i-forget-memory-workflow
```

Why this is a Lambda-track project:

- The user-facing memory flow is decomposed into independently deployable Lambda functions.
- Step Functions gives judges a visible execution graph for the story workflow.
- DynamoDB persistence happens in the final Lambda, not in the browser.
- Mock AI is isolated inside Lambda boundaries so Bedrock can replace it without redesigning the frontend.
- S3 presigned uploads keep large files out of Lambda while still using Lambda/API routes for secure control.

The final output includes:

```json
{
  "sessionId": "nani-1234567890",
  "memoryId": "nani-1234567890",
  "transcript": "...",
  "translatedText": "...",
  "memoryCard": {},
  "gratitudeLetter": "...",
  "status": "SUCCEEDED"
}
```

## Environment Variables

Each Lambda receives these environment values:

- `AWS_REGION`, provided automatically by the Lambda runtime
- `STEP_FUNCTION_ARN`, configured in `template.yaml`
- `MEMORY_TABLE_NAME`, configured in `template.yaml`

`MEMORY_TABLE_NAME` points to the existing `BeforeIForgetMemories` DynamoDB table used by the Next.js backend bridge on `main`. The `saveMemoryResult` Lambda writes the final MemoryCard-shaped result to DynamoDB using `memoryId` as the table key, then returns the same payload as the Step Functions output.

## Deploy

From this folder:

```bash
sam build
sam deploy --guided
```

During guided deploy, choose a stack name such as `before-i-forget-workflow`, confirm the AWS Region, and allow SAM to create the required IAM roles.

After deploy completes, SAM prints the `MemoryWorkflowArn` output. You can also find the state machine in the AWS Console under Step Functions.

## Test from AWS Console

1. Open the AWS Console.
2. Go to Step Functions.
3. Select the `before-i-forget-memory-workflow` state machine.
4. Choose **Start execution**.
5. Copy the contents of `sample-input.json` into the execution input box:

```json
{
  "personName": "Nani",
  "relationship": "Grandmother",
  "country": "India",
  "language": "Hindi",
  "memoryType": "Recipe",
  "storyText": "She made chai for me every morning before school."
}
```

6. Start the execution and wait for it to finish.
7. Open the execution output. It should contain `sessionId`, `transcript`, `translatedText`, `memoryCard`, `gratitudeLetter`, and `"status": "SUCCEEDED"`.
