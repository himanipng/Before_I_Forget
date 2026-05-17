import { DescribeExecutionCommand, StartExecutionCommand } from "@aws-sdk/client-sfn";
import { env, hasStepFunctionConfig } from "@/lib/env";
import { generateMockMemoryCard } from "@/lib/mockMemory";
import type { MemoryCard, MemoryInput } from "@/lib/types";
import { getSFNClient } from "./clients";

const START_WORKFLOW_TIMEOUT_MS = 8000;

type StartMemoryWorkflowResult = {
  executionArn?: string;
  memoryCard: MemoryCard;
  mock: boolean;
  warning?: string;
};

export async function startMemoryWorkflow(
  input: MemoryInput,
): Promise<StartMemoryWorkflowResult> {
  const sfnClient = getSFNClient();
  const memoryCard = generateMockMemoryCard(input);

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
        memoryCard: { ...memoryCard, status: "RUNNING" },
        mock: false,
      };
    } catch (error) {
      return {
        memoryCard,
        mock: true,
        warning: error instanceof Error ? error.message : "Step Functions did not start; using mock memory.",
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  return {
    memoryCard,
    mock: true,
  };
}

export async function getWorkflowStatus(executionArn?: string) {
  const sfnClient = getSFNClient();

  if (hasStepFunctionConfig && sfnClient && executionArn) {
    const result = await sfnClient.send(new DescribeExecutionCommand({ executionArn }));
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
