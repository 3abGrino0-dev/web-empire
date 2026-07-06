import "server-only";

import type { ToolRecord } from "@/domain/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface ToolAccessPolicy {
  planId: string | null;
  maxOutputTokens: number | null;
}

function relationRecord(value: unknown): Record<string, unknown> {
  if (Array.isArray(value)) {
    const first = value[0];
    return first && typeof first === "object"
      ? (first as Record<string, unknown>)
      : {};
  }
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function minimumLimit(...values: Array<number | null | undefined>): number | null {
  const limits = values.filter(
    (value): value is number => typeof value === "number" && value > 0,
  );
  return limits.length ? Math.min(...limits) : null;
}

export async function enforceToolAccess(
  tool: ToolRecord,
  userId: string | null,
): Promise<ToolAccessPolicy> {
  if (!userId) {
    if (tool.requires_auth || tool.pricing_mode !== "free") {
      throw new Error("LOGIN_REQUIRED");
    }
    return { planId: null, maxOutputTokens: null };
  }

  const supabase = createSupabaseAdminClient();
  const [{ data: subscription }, { count: accessCount }] = await Promise.all([
    supabase
      .from("user_subscriptions")
      .select("plan_id, plans(daily_ai_runs, max_output_tokens)")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle(),
    supabase
      .from("tool_plan_access")
      .select("*", { count: "exact", head: true })
      .eq("tool_id", tool.id),
  ]);

  const planId = subscription?.plan_id ? String(subscription.plan_id) : null;
  const plan = relationRecord(subscription?.plans);
  const planDailyAiRuns = Number(plan.daily_ai_runs ?? 0) || null;
  const planMaxOutputTokens = Number(plan.max_output_tokens ?? 0) || null;

  if (
    planDailyAiRuns &&
    ["ai_text", "ai_structured", "workflow"].includes(tool.engine_type)
  ) {
    const { data: aiTools, error: aiToolsError } = await supabase
      .from("tools")
      .select("id")
      .in("engine_type", ["ai_text", "ai_structured", "workflow"]);

    if (aiToolsError) throw new Error(aiToolsError.message);
    const aiToolIds = (aiTools ?? []).map((item) => String(item.id));

    if (aiToolIds.length) {
      const start = new Date();
      start.setUTCHours(0, 0, 0, 0);
      const { count, error: countError } = await supabase
        .from("tool_runs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .in("tool_id", aiToolIds)
        .in("status", ["running", "completed"])
        .gte("created_at", start.toISOString());

      if (countError) throw new Error(countError.message);
      if ((count ?? 0) >= planDailyAiRuns) throw new Error("DAILY_AI_PLAN_LIMIT_REACHED");
    }
  }

  if (!accessCount) {
    return { planId, maxOutputTokens: planMaxOutputTokens };
  }
  if (!planId) throw new Error("PLAN_REQUIRED");

  const { data: access, error } = await supabase
    .from("tool_plan_access")
    .select("is_allowed, daily_run_limit, max_output_tokens")
    .eq("tool_id", tool.id)
    .eq("plan_id", planId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!access?.is_allowed) throw new Error("TOOL_NOT_INCLUDED_IN_PLAN");

  if (access.daily_run_limit) {
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    const { count, error: countError } = await supabase
      .from("tool_runs")
      .select("*", { count: "exact", head: true })
      .eq("tool_id", tool.id)
      .eq("user_id", userId)
      .in("status", ["running", "completed"])
      .gte("created_at", start.toISOString());

    if (countError) throw new Error(countError.message);
    if ((count ?? 0) >= access.daily_run_limit) throw new Error("DAILY_TOOL_LIMIT_REACHED");
  }

  return {
    planId,
    maxOutputTokens: minimumLimit(
      planMaxOutputTokens,
      access.max_output_tokens ?? null,
    ),
  };
}
