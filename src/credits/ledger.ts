import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function reserveCredits(
  userId: string,
  runId: string,
  amount: number
): Promise<number> {
  if (amount <= 0) return Number.MAX_SAFE_INTEGER;

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc("reserve_credits", {
    p_user_id: userId,
    p_tool_run_id: runId,
    p_amount: amount
  });

  if (error) throw new Error(error.message);
  return Number(data);
}

export async function settleCredits(
  userId: string,
  runId: string,
  reserved: number,
  actual: number
): Promise<number> {
  if (reserved <= 0) return Number.MAX_SAFE_INTEGER;

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc("settle_credits", {
    p_user_id: userId,
    p_tool_run_id: runId,
    p_reserved: reserved,
    p_actual: actual
  });

  if (error) throw new Error(error.message);
  return Number(data);
}

export async function releaseCredits(
  userId: string,
  runId: string,
  reserved: number
): Promise<void> {
  if (reserved <= 0) return;

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.rpc("release_credits", {
    p_user_id: userId,
    p_tool_run_id: runId,
    p_reserved: reserved
  });

  if (error) throw new Error(error.message);
}
