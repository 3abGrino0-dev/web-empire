import type { ModelRecord, ProviderUsage, ToolRecord } from "@/domain/types";

const USD_TO_SAR = 3.75;

export function estimateTokenCount(text: string): number {
  return Math.max(1, Math.ceil(text.length / 1.2));
}

export function providerCostSar(model: ModelRecord, usage: ProviderUsage): number {
  const regularInput = Math.max(
    0,
    usage.inputTokens - (usage.cachedInputTokens ?? 0)
  );

  const usd =
    (regularInput / 1_000_000) * model.input_cost_per_million_usd +
    ((usage.cachedInputTokens ?? 0) / 1_000_000) *
      model.cached_input_cost_per_million_usd +
    (usage.outputTokens / 1_000_000) *
      model.output_cost_per_million_usd;

  return usd * USD_TO_SAR;
}

export function calculateDynamicPoints(
  tool: ToolRecord,
  model: ModelRecord,
  usage: ProviderUsage,
  pointsPerSar: number
): number {
  if (tool.pricing_mode === "free") return 0;
  if (tool.pricing_mode === "fixed") return tool.fixed_points;

  const raw =
    providerCostSar(model, usage) *
    pointsPerSar *
    tool.cost_multiplier;

  return Math.max(tool.minimum_points, Math.ceil(raw));
}

export function estimateDynamicPoints(
  tool: ToolRecord,
  model: ModelRecord,
  prompt: string,
  maxOutputTokens: number,
  pointsPerSar: number
): number {
  return calculateDynamicPoints(
    tool,
    model,
    {
      inputTokens: estimateTokenCount(prompt),
      outputTokens: maxOutputTokens
    },
    pointsPerSar
  );
}

export function calculateProviderCostPoints(
  tool: ToolRecord,
  providerCostSarValue: number,
  pointsPerSar: number,
): number {
  if (tool.pricing_mode === "free") return 0;
  if (tool.pricing_mode === "fixed") return tool.fixed_points;

  const raw = providerCostSarValue * pointsPerSar * tool.cost_multiplier;
  return Math.max(tool.minimum_points, Math.ceil(raw));
}
