import "server-only";

import type { JsonValue, ToolRecord } from "@/domain/types";
import { executeAiRuntime } from "@/engines/runtime/ai";
import {
  mapContextObject,
  renderContextTemplate,
  type WorkflowContext,
} from "@/engines/runtime/context";
import { executeHttpRuntime, type HttpRuntimeConfig } from "@/engines/runtime/http";
import { evaluateFormula } from "@/engines/formula";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

interface WorkflowStepRecord {
  id: string;
  workflow_id: string;
  step_key: string;
  name: string;
  step_type:
    | "template"
    | "formula"
    | "http_api"
    | "webhook"
    | "ai_text"
    | "ai_structured";
  sort_order: number;
  config: Record<string, unknown>;
  continue_on_error: boolean;
}

export interface WorkflowRuntimeResult {
  text: string;
  data: JsonValue;
  providerCostSar: number;
  providerId?: string;
  modelId?: string;
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens: number;
}

async function recordStepStart(
  runId: string,
  stepId: string,
  context: WorkflowContext,
): Promise<string> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("workflow_step_runs")
    .insert({
      tool_run_id: runId,
      workflow_step_id: stepId,
      status: "running",
      input_snapshot: {
        input: context.input,
        available_steps: Object.keys(context.steps),
      },
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return String(data.id);
}

async function finishStep(
  stepRunId: string,
  status: "completed" | "failed",
  output: unknown,
  errorMessage?: string,
): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("workflow_step_runs")
    .update({
      status,
      output_payload: output ?? null,
      error_message: errorMessage?.slice(0, 2000) ?? null,
      completed_at: new Date().toISOString(),
    })
    .eq("id", stepRunId);

  if (error) throw new Error(error.message);
}

function toJson(value: unknown): JsonValue {
  return JSON.parse(JSON.stringify(value)) as JsonValue;
}

export async function executeWorkflowRuntime(
  tool: ToolRecord,
  workflowId: string,
  input: Record<string, unknown>,
  runId: string,
  maxOutputTokensLimit: number | null,
): Promise<WorkflowRuntimeResult> {
  const supabase = createSupabaseAdminClient();
  const { data: workflow, error: workflowError } = await supabase
    .from("workflows")
    .select("id, is_active")
    .eq("id", workflowId)
    .eq("is_active", true)
    .single();

  if (workflowError || !workflow) throw new Error("WORKFLOW_NOT_FOUND");

  const { data, error } = await supabase
    .from("workflow_steps")
    .select("*")
    .eq("workflow_id", workflowId)
    .order("sort_order");

  if (error) throw new Error(error.message);
  const steps = (data ?? []) as WorkflowStepRecord[];
  if (!steps.length) throw new Error("WORKFLOW_HAS_NO_STEPS");
  if (steps.length > 30) throw new Error("WORKFLOW_STEP_LIMIT_EXCEEDED");

  const context: WorkflowContext = { input, steps: {} };
  let providerCostTotal = 0;
  let lastProviderId: string | undefined;
  let lastModelId: string | undefined;
  let inputTokens = 0;
  let outputTokens = 0;
  let cachedInputTokens = 0;

  for (const step of steps) {
    const stepRunId = await recordStepStart(runId, step.id, context);

    try {
      let output: { text?: string; data?: JsonValue };

      if (step.step_type === "template") {
        const text = renderContextTemplate(String(step.config.template ?? ""), context);
        output = { text, data: { text } };
      } else if (step.step_type === "formula") {
        const variables = mapContextObject(
          (step.config.variables ?? {}) as Record<string, unknown>,
          context,
        );
        const result = evaluateFormula(String(step.config.expression ?? ""), variables);
        output = { text: String(result), data: { result } };
      } else if (step.step_type === "http_api" || step.step_type === "webhook") {
        const httpResult = await executeHttpRuntime(
          step.config as unknown as HttpRuntimeConfig,
          context,
          step.step_type === "webhook",
        );
        output = { text: httpResult.text, data: httpResult.data };
      } else {
        const prompt = renderContextTemplate(
          String(step.config.prompt_template ?? ""),
          context,
        );
        const ai = await executeAiRuntime(
          tool,
          {
            model_alias: String(step.config.model_alias ?? tool.model_alias ?? "standard"),
            provider_strategy: (step.config.provider_strategy ?? tool.provider_strategy) as ToolRecord["provider_strategy"],
            max_output_tokens: Number(step.config.max_output_tokens ?? 2000),
            output_schema:
              step.step_type === "ai_structured"
                ? (step.config.output_schema as JsonValue)
                : undefined,
          },
          prompt,
          maxOutputTokensLimit,
          runId,
          step.step_key,
        );

        providerCostTotal += ai.providerCostSar;
        inputTokens += ai.result.usage.inputTokens;
        outputTokens += ai.result.usage.outputTokens;
        cachedInputTokens += ai.result.usage.cachedInputTokens ?? 0;
        lastProviderId = ai.providerId;
        lastModelId = ai.modelId;
        output = { text: ai.result.text, data: ai.result.data };
      }

      context.steps[step.step_key] = output;
      await finishStep(stepRunId, "completed", output);
    } catch (error) {
      const message = error instanceof Error ? error.message : "WORKFLOW_STEP_FAILED";
      await finishStep(stepRunId, "failed", null, message);

      if (!step.continue_on_error) throw error;
      context.steps[step.step_key] = { data: { error: message } };
    }
  }

  const finalStep = steps.at(-1);
  const finalOutput = finalStep ? context.steps[finalStep.step_key] : undefined;

  return {
    text: finalOutput?.text ?? "",
    data: toJson({ steps: context.steps, output: finalOutput ?? null }),
    providerCostSar: providerCostTotal,
    providerId: lastProviderId,
    modelId: lastModelId,
    inputTokens,
    outputTokens,
    cachedInputTokens,
  };
}
