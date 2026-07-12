import "server-only";

import type { JsonValue, ToolRecord, ToolRunResponse } from "@/domain/types";
import { getProviderCandidates } from "@/ai/providers";
import { getToolSkillInstructions } from "@/ai/skills";
import {
  calculateProviderCostPoints,
  estimateDynamicPoints,
} from "@/credits/pricing";
import { releaseCredits, reserveCredits, settleCredits } from "@/credits/ledger";
import { evaluateFormula } from "@/engines/formula";
import { enforceToolAccess } from "@/engines/runtime/access";
import { executeAiRuntime } from "@/engines/runtime/ai";
import type { WorkflowContext } from "@/engines/runtime/context";
import { executeHttpRuntime, type HttpRuntimeConfig } from "@/engines/runtime/http";
import { executeTextTransform } from "@/engines/runtime/text-transform";
import { executeWorkflowRuntime } from "@/engines/runtime/workflow";
import { getCurrentUserId } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { renderTemplate } from "@/lib/template";
import { validateDynamicInput } from "@/lib/validation";
import { getToolBySlug, getToolRuntimeBySlug } from "@/repositories/catalog";

interface EngineResult {
  text?: string;
  data?: JsonValue;
  providerCostSar: number;
  providerId?: string;
  modelId?: string;
  providerResponseId?: string;
  inputTokens?: number;
  outputTokens?: number;
  cachedInputTokens?: number;
}

async function getPointsPerSar(): Promise<number> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("platform_settings")
    .select("value")
    .eq("key", "points_per_sar_provider_cost")
    .maybeSingle();

  return typeof data?.value === "number" ? data.value : 650;
}

async function createRun(
  tool: ToolRecord,
  userId: string | null,
  input: Record<string, unknown>,
): Promise<string> {
  const supabase = createSupabaseAdminClient();
  const workflowId =
    tool.engine_type === "workflow"
      ? String(tool.runtime_config.workflow_id ?? "") || null
      : null;

  const { data, error } = await supabase
    .from("tool_runs")
    .insert({
      tool_id: tool.id,
      user_id: userId,
      workflow_id: workflowId,
      status: "running",
      input_payload: input,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return String(data.id);
}

async function finishRun(
  runId: string,
  status: "completed" | "failed",
  values: Record<string, unknown>,
): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("tool_runs")
    .update({
      ...values,
      status,
      completed_at: new Date().toISOString(),
    })
    .eq("id", runId);

  if (error) throw new Error(error.message);
}

async function estimateReservation(
  tool: ToolRecord,
  input: Record<string, unknown>,
  maxOutputTokensLimit: number | null,
  pointsPerSar: number,
): Promise<number> {
  if (tool.pricing_mode === "free") return 0;
  if (tool.pricing_mode === "fixed") return tool.fixed_points;

  if (tool.engine_type === "ai_text" || tool.engine_type === "ai_structured") {
    const candidates = await getProviderCandidates(tool);
    const candidate = candidates[0];
    if (!candidate) throw new Error("AI_PROVIDER_NOT_AVAILABLE");
    const skillInstructions = await getToolSkillInstructions(tool.id);
    const prompt = renderTemplate(tool.prompt_template ?? "", input);
    const maxOutputTokens = Math.min(
      Number(tool.runtime_config.max_output_tokens ?? 2000),
      candidate.model.max_output_tokens,
      maxOutputTokensLimit ?? Number.MAX_SAFE_INTEGER,
    );

    return estimateDynamicPoints(
      tool,
      candidate.model,
      `${skillInstructions}\n\n${prompt}`,
      maxOutputTokens,
      pointsPerSar,
    );
  }

  if (tool.engine_type === "workflow") {
    return Math.max(
      tool.minimum_points,
      Number(tool.runtime_config.reservation_points ?? 100),
    );
  }

  return tool.minimum_points;
}

async function executeEngine(
  tool: ToolRecord,
  input: Record<string, unknown>,
  runId: string,
  maxOutputTokensLimit: number | null,
  localeCode: string,
): Promise<EngineResult> {
  if (tool.engine_type === "formula") {
    const result = evaluateFormula(String(tool.runtime_config.expression ?? ""), input);
    return { text: String(result), data: { result }, providerCostSar: 0 };
  }

  if (tool.engine_type === "text_transform") {
    const result = executeTextTransform(tool, input, localeCode);
    return { ...result, providerCostSar: 0 };
  }

  if (tool.engine_type === "http_api" || tool.engine_type === "webhook") {
    const context: WorkflowContext = { input, steps: {} };
    const result = await executeHttpRuntime(
      tool.runtime_config as unknown as HttpRuntimeConfig,
      context,
      tool.engine_type === "webhook",
    );
    return { text: result.text, data: result.data, providerCostSar: 0 };
  }

  if (tool.engine_type === "ai_text" || tool.engine_type === "ai_structured") {
    const prompt = renderTemplate(tool.prompt_template ?? "", input);
    const ai = await executeAiRuntime(
      tool,
      {
        max_output_tokens: Number(tool.runtime_config.max_output_tokens ?? 2000),
        output_schema:
          tool.engine_type === "ai_structured" ? tool.output_schema : undefined,
      },
      prompt,
      maxOutputTokensLimit,
      runId,
    );

    return {
      text: ai.result.text,
      data: ai.result.data,
      providerCostSar: ai.providerCostSar,
      providerId: ai.providerId,
      modelId: ai.modelId,
      providerResponseId: ai.result.providerResponseId,
      inputTokens: ai.result.usage.inputTokens,
      outputTokens: ai.result.usage.outputTokens,
      cachedInputTokens: ai.result.usage.cachedInputTokens,
    };
  }

  if (tool.engine_type === "workflow") {
    const workflowId = String(tool.runtime_config.workflow_id ?? "");
    if (!workflowId) throw new Error("WORKFLOW_ID_REQUIRED");
    return executeWorkflowRuntime(tool, workflowId, input, runId, maxOutputTokensLimit);
  }

  throw new Error(`ENGINE_NOT_ENABLED:${tool.engine_type}`);
}

export async function runTool(
  slug: string,
  input: Record<string, unknown>,
  localeCode = "en",
  userIdOverride?: string,
): Promise<ToolRunResponse> {
  const tool = await getToolRuntimeBySlug(slug);
  if (!tool) throw new Error("TOOL_NOT_FOUND");

  const errors = validateDynamicInput(tool.input_schema, input);
  if (Object.keys(errors).length) {
    throw new Error(JSON.stringify({ code: "VALIDATION_ERROR", errors }));
  }

  const userId = userIdOverride ?? (await getCurrentUserId());
  const access = await enforceToolAccess(tool, userId);
  const pointsPerSar =
    tool.pricing_mode === "free" ? 0 : await getPointsPerSar();
  const localizedToolPromise = getToolBySlug(slug, localeCode);
  const runId = await createRun(tool, userId, input);
  let reserved = 0;

  try {
    reserved = await estimateReservation(
      tool,
      input,
      access.maxOutputTokens,
      pointsPerSar,
    );

    if (userId && reserved > 0) {
      await reserveCredits(userId, runId, reserved);
    }

    const result = await executeEngine(
      tool,
      input,
      runId,
      access.maxOutputTokens,
      localeCode,
    );
    const actual = calculateProviderCostPoints(
      tool,
      result.providerCostSar,
      pointsPerSar,
    );

    const balanceAfter =
      userId && reserved > 0
        ? await settleCredits(userId, runId, reserved, actual)
        : undefined;

    await finishRun(runId, "completed", {
      provider_id: result.providerId ?? null,
      model_id: result.modelId ?? null,
      provider_response_id: result.providerResponseId ?? null,
      output_payload: result.data ?? { text: result.text ?? "" },
      input_tokens: result.inputTokens ?? 0,
      output_tokens: result.outputTokens ?? 0,
      cached_input_tokens: result.cachedInputTokens ?? 0,
      credits_reserved: reserved,
      credits_charged: actual,
    });

    const localizedTool = await localizedToolPromise;

    return {
      runId,
      title: localizedTool?.title ?? tool.title_en,
      text: result.text,
      data: result.data,
      creditsCharged: actual,
      balanceAfter,
    };
  } catch (error) {
    if (userId && reserved > 0) {
      await releaseCredits(userId, runId, reserved).catch(() => undefined);
    }

    const message = error instanceof Error ? error.message : "TOOL_RUN_FAILED";
    await finishRun(runId, "failed", { error_message: message.slice(0, 2000) });
    throw error;
  }
}
