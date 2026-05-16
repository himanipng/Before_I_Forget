import { DescribeExecutionCommand, StartExecutionCommand } from "@aws-sdk/client-sfn";
import { env, hasStepFunctionConfig } from "@/lib/env";
import { generateMockMemoryCard } from "@/lib/mockMemory";
import type { MemoryCard, MemoryInput } from "@/lib/types";
import { getSFNClient } from "./clients";

export async function startMemoryWorkflow(
  input: MemoryInput,
): Promise<{ executionArn?: string; memoryCard?: MemoryCard; mock: boolean }> {
  const sfnClient = getSFNClient();

  if (hasStepFunctionConfig && sfnClient) {
    const result = await sfnClient.send(
      new StartExecutionCommand({
        stateMachineArn: env.STEP_FUNCTION_ARN,
        input: JSON.stringify(input),
      }),
    );

    return { executionArn: result.executionArn, mock: false };
  }

  return {
    memoryCard: generateMockMemoryCard(input),
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
