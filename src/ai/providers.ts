import "server-only";

import type { ModelRecord, ProviderRecord, ToolRecord } from "@/domain/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface ProviderCandidate {
  provider: ProviderRecord;
  model: ModelRecord;
  apiKey: string;
}

async function getSecret(providerId: string): Promise<string> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc("get_ai_provider_secret", {
    p_provider_id: providerId
  });

  if (error || !data) throw new Error("Provider secret is not configured.");
  return String(data);
}

export async function getProviderCandidates(
  tool: ToolRecord
): Promise<ProviderCandidate[]> {
  const supabase = createSupabaseAdminClient();

  const { data: models, error } = await supabase
    .from("ai_models")
    .select("*, ai_providers(*)")
    .eq("is_active", true)
    .eq("alias", tool.model_alias ?? "standard")
    .order("priority");

  if (error) throw new Error(error.message);

  const candidates = (models ?? []).flatMap((model) => {
    const provider = model.ai_providers as unknown as ProviderRecord | null;
    if (!provider?.is_active) return [];
    return [{ provider, model: model as unknown as ModelRecord }];
  });

  if (tool.provider_strategy === "lowest_cost") {
    candidates.sort((left, right) => {
      const leftCost =
        left.model.input_cost_per_million_usd +
        left.model.output_cost_per_million_usd;
      const rightCost =
        right.model.input_cost_per_million_usd +
        right.model.output_cost_per_million_usd;
      return leftCost - rightCost;
    });
  }

  const result: ProviderCandidate[] = [];

  for (const candidate of candidates) {
    try {
      const apiKey = await getSecret(candidate.provider.id);
      result.push({ ...candidate, apiKey });
    } catch {
      continue;
    }
  }

  return result;
}
