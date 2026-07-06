import "server-only";

import type {
  BillingProviderRecord,
  BillingProviderSecrets,
} from "@/billing/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function getActiveBillingProvider(
  slug?: string,
): Promise<{ provider: BillingProviderRecord; secrets: BillingProviderSecrets }> {
  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("billing_providers")
    .select("*")
    .eq("is_active", true)
    .order("priority")
    .limit(1);

  if (slug) query = query.eq("slug", slug);

  const { data, error } = await query.maybeSingle();
  if (error || !data) throw new Error("BILLING_PROVIDER_NOT_AVAILABLE");

  const provider = data as BillingProviderRecord;
  const { data: secretRows, error: secretError } = await supabase.rpc(
    "get_billing_provider_secrets",
    { p_provider_id: provider.id },
  );

  if (secretError) throw new Error(secretError.message);
  const row = Array.isArray(secretRows) ? secretRows[0] : secretRows;
  const values = row && typeof row === "object" ? (row as Record<string, unknown>) : {};
  const apiSecret = String(values.api_secret ?? "");
  const webhookSecret = String(values.webhook_secret ?? "");

  if (!apiSecret) throw new Error("BILLING_API_SECRET_MISSING");

  return {
    provider,
    secrets: { apiSecret, webhookSecret },
  };
}
