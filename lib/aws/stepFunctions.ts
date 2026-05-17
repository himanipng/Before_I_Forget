import { DescribeExecutionCommand, StartExecutionCommand } from "@aws-sdk/client-sfn";
import { env, hasStepFunctionConfig } from "@/lib/env";
import { generateMemoryFromStoryWithBedrock } from "@/lib/aws/bedrock";
import type { MemoryCard, MemoryInput } from "@/lib/types";
import { getSFNClient } from "./clients";

const START_WORKFLOW_TIMEOUT_MS = 8000;

type StartMemoryWorkflowResult = {
  executionArn?: string;
  memoryCard: MemoryCard;
  mock: boolean;
  warning?: string;
  aiProvider?: "bedrock-claude" | "mock-ai";
};

export async function startMemoryWorkflow(
  input: MemoryInput,
): Promise<StartMemoryWorkflowResult> {
  const sfnClient = getSFNClient();
  const generated = await generateMemoryFromStoryWithBedrock(input);
  const memoryCard = generated.data;

  if (hasStepFunctionConfig && sfnClient) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), START_WORKFLOW_TIMEOUT_MS);

    try {
      const result = await sfnClient.send(
        new StartExecutionCommand({
          stateMachineArn: env.STEP_FUNCTION_ARN,
          input: JSON.stringify(input),
        }),
        { abortSignal: controller.signal },
      );

      return {
        executionArn: result.executionArn,
        memoryCard: { ...memoryCard, provider: generated.provider, status: "RUNNING" },
        mock: false,
        aiProvider: generated.provider,
        warning: generated.warning,
      };
    } catch (error) {
      return {
        memoryCard: { ...memoryCard, provider: generated.provider },
        mock: true,
        aiProvider: generated.provider,
        warning: error instanceof Error ? error.message : "Step Functions did not start; using backup memory.",
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  return {
    memoryCard: { ...memoryCard, provider: generated.provider },
    mock: true,
    aiProvider: generated.provider,
    warning: generated.warning,
  };
}

export async function getWorkflowStatus(executionArn?: string) {
  const sfnClient = getSFNClient();

  if (hasStepFunctionConfig && sfnClient && executionArn) {
    let result;

    try {
      result = await sfnClient.send(new DescribeExecutionCommand({ executionArn }));
    } catch (error) {
      if (error instanceof Error && error.name === "AccessDeniedException") {
        return {
          status: "RUNNING",
          output: undefined,
          mock: false,
          warning:
            "Step Functions execution started, but the Vercel IAM user still needs states:DescribeExecution on execution ARNs.",
        };
      }

      throw error;
    }

    return {
      status: result.status,
      output: result.output ? JSON.parse(result.output) : undefined,
      mock: false,
    };
  }

  return {
    status: "SUCCEEDED",
    output: undefined,
    mock: true,
  };
}
