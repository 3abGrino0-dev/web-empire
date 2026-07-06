import "server-only";

import type {
  AiExecutionResult,
  JsonValue,
  ToolRecord,
} from "@/domain/types";
import { getProviderAdapter } from "@/ai/adapters/registry";
import { getProviderCandidates } from "@/ai/providers";
import { getToolSkillInstructions } from "@/ai/skills";
import { providerCostSar } from "@/credits/pricing";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface AiRuntimeConfig {
  model_alias?: string;
  provider_strategy?: ToolRecord["provider_strategy"];
  max_output_tokens?: number;
  prompt_template?: string;
  output_schema?: JsonValue;
}

export interface AiRuntimeStepResult {
  result: AiExecutionResult;
  providerId: string;
  modelId: string;
  providerCostSar: number;
}

export async function executeAiRuntime(
  tool: ToolRecord,
  config: AiRuntimeConfig,
  prompt: string,
  maxOutputTokensLimit: number | null,
  runId: string,
  stepKey?: string,
): Promise<AiRuntimeStepResult> {
  const candidateTool: ToolRecord = {
    ...tool,
    model_alias: config.model_alias ?? tool.model_alias,
    provider_strategy: config.provider_strategy ?? tool.provider_strategy,
  };

  const candidates = await getProviderCandidates(candidateTool);
  if (!candidates.length) throw new Error("AI_PROVIDER_NOT_AVAILABLE");

  const skillInstructions = await getToolSkillInstructions(tool.id);
  let lastError: Error | null = null;

  for (const candidate of candidates) {
    try {
      const requestedMax = Number(config.max_output_tokens ?? 2000);
      const maxOutputTokens = Math.min(
        requestedMax,
        candidate.model.max_output_tokens,
        maxOutputTokensLimit ?? Number.MAX_SAFE_INTEGER,
      );

      const adapter = getProviderAdapter(candidate.provider.adapter_type);
      const result = await adapter.execute({
        provider: candidate.provider,
        model: candidate.model,
        apiKey: candidate.apiKey,
        systemInstructions: skillInstructions,
        prompt,
        maxOutputTokens,
        outputSchema: config.output_schema,
        metadata: {
          web_empire_tool: tool.slug,
          web_empire_run: runId,
          ...(stepKey ? { web_empire_step: stepKey } : {}),
        },
      });

      const costSar = providerCostSar(candidate.model, result.usage);
      const supabase = createSupabaseAdminClient();
      const estimatedCostUsd = costSar / 3.75;

      const { error: usageError } = await supabase.from("provider_usage").insert({
        tool_run_id: runId,
        provider_id: candidate.provider.id,
        model_id: candidate.model.id,
        input_tokens: result.usage.inputTokens,
        output_tokens: result.usage.outputTokens,
        cached_input_tokens: result.usage.cachedInputTokens ?? 0,
        estimated_cost_usd: estimatedCostUsd,
      });

      if (usageError) throw new Error(usageError.message);

      return {
        result,
        providerId: candidate.provider.id,
        modelId: candidate.model.id,
        providerCostSar: costSar,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("AI_RUNTIME_FAILED");
      if (candidateTool.provider_strategy === "manual") break;
    }
  }

  throw lastError ?? new Error("AI_RUNTIME_FAILED");
}
