import "server-only";

import { getBillingAdapter } from "@/billing/adapters/registry";
import type { NormalizedBillingEvent, SubscriptionSnapshot } from "@/billing/types";
import { getActiveBillingProvider } from "@/billing/providers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function normalizeSubscriptionStatus(status: string): string {
  return status === "active" || status === "trialing" ? "active" : status;
}

async function activateSubscription(
  providerId: string,
  snapshot: SubscriptionSnapshot,
): Promise<void> {
  if (!snapshot.userId || !snapshot.planId || !snapshot.subscriptionId) {
    throw new Error("BILLING_SUBSCRIPTION_METADATA_MISSING");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.rpc("activate_billing_subscription", {
    p_user_id: snapshot.userId,
    p_plan_id: snapshot.planId,
    p_provider_id: providerId,
    p_customer_id: snapshot.customerId ?? "",
    p_subscription_id: snapshot.subscriptionId,
    p_status: normalizeSubscriptionStatus(snapshot.status),
    p_period_start: snapshot.periodStart ?? null,
    p_period_end: snapshot.periodEnd ?? null,
    p_cancel_at_period_end: snapshot.cancelAtPeriodEnd,
  });

  if (error) throw new Error(error.message);
}

async function resolveSubscriptionSnapshot(
  providerId: string,
  apiSecret: string,
  adapterType: "stripe_checkout",
  event: NormalizedBillingEvent,
): Promise<SubscriptionSnapshot> {
  if (!event.subscriptionId) throw new Error("BILLING_SUBSCRIPTION_ID_MISSING");

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("user_subscriptions")
    .select("user_id, plan_id, external_customer_id, external_subscription_id, status, current_period_start, current_period_end, cancel_at_period_end")
    .eq("billing_provider_id", providerId)
    .eq("external_subscription_id", event.subscriptionId)
    .maybeSingle();

  if (data) {
    return {
      userId: String(data.user_id),
      planId: String(data.plan_id),
      customerId: data.external_customer_id ? String(data.external_customer_id) : undefined,
      subscriptionId: String(data.external_subscription_id),
      status: String(data.status),
      periodStart: data.current_period_start ? String(data.current_period_start) : undefined,
      periodEnd: data.current_period_end ? String(data.current_period_end) : undefined,
      cancelAtPeriodEnd: Boolean(data.cancel_at_period_end),
    };
  }

  const adapter = getBillingAdapter(adapterType);
  return adapter.retrieveSubscription(apiSecret, event.subscriptionId);
}

async function processNormalizedEvent(
  providerId: string,
  apiSecret: string,
  adapterType: "stripe_checkout",
  event: NormalizedBillingEvent,
): Promise<void> {
  const supabase = createSupabaseAdminClient();

  if (event.type === "ignored") return;

  if (event.type === "checkout_completed") {
    if (!event.userId || !event.planId || !event.subscriptionId) {
      throw new Error("CHECKOUT_METADATA_MISSING");
    }
    const snapshot = await getBillingAdapter(adapterType).retrieveSubscription(
      apiSecret,
      event.subscriptionId,
    );
    await activateSubscription(providerId, {
      ...snapshot,
      userId: snapshot.userId ?? event.userId,
      planId: snapshot.planId ?? event.planId,
      customerId: snapshot.customerId ?? event.customerId,
    });
    return;
  }

  if (event.type === "subscription_updated" || event.type === "subscription_deleted") {
    await activateSubscription(providerId, {
      userId: event.userId,
      planId: event.planId,
      customerId: event.customerId,
      subscriptionId: event.subscriptionId ?? "",
      status: event.subscriptionStatus ?? "inactive",
      periodStart: event.periodStart,
      periodEnd: event.periodEnd,
      cancelAtPeriodEnd: Boolean(event.cancelAtPeriodEnd),
    });
    return;
  }

  if (event.type === "invoice_paid") {
    if (!event.invoiceId) throw new Error("BILLING_INVOICE_ID_MISSING");
    const snapshot = await resolveSubscriptionSnapshot(
      providerId,
      apiSecret,
      adapterType,
      event,
    );

    await activateSubscription(providerId, snapshot);

    if (!snapshot.userId || !snapshot.planId) {
      throw new Error("BILLING_SUBSCRIPTION_METADATA_MISSING");
    }

    const periodKey = snapshot.periodStart ?? `invoice-${event.invoiceId}`;
    const { error } = await supabase.rpc("grant_subscription_credits", {
      p_user_id: snapshot.userId,
      p_plan_id: snapshot.planId,
      p_grant_key: `billing:${providerId}:subscription:${snapshot.subscriptionId}:period:${periodKey}`,
      p_description: `Subscription credits for billing period ${periodKey}`,
    });

    if (error) throw new Error(error.message);
  }
}

export async function createBillingCheckout(
  userId: string,
  planId: string,
  locale: string,
): Promise<{ url: string }> {
  const supabase = createSupabaseAdminClient();
  const { provider, secrets } = await getActiveBillingProvider();
  const adapter = getBillingAdapter(provider.adapter_type);

  const [{ data: price, error: priceError }, userResult] = await Promise.all([
    supabase
      .from("billing_plan_prices")
      .select("external_price_id")
      .eq("billing_provider_id", provider.id)
      .eq("plan_id", planId)
      .eq("is_active", true)
      .single(),
    supabase.auth.admin.getUserById(userId),
  ]);

  if (priceError || !price) throw new Error("PLAN_BILLING_PRICE_NOT_CONFIGURED");
  const checkout = await adapter.createCheckout({
    provider,
    apiSecret: secrets.apiSecret,
    externalPriceId: String(price.external_price_id),
    userId,
    userEmail: userResult.data.user?.email,
    planId,
    locale,
  });

  return { url: checkout.url };
}

export async function processBillingWebhook(
  providerSlug: string,
  rawBody: string,
  headers: Headers,
): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { provider, secrets } = await getActiveBillingProvider(providerSlug);
  if (!secrets.webhookSecret) throw new Error("BILLING_WEBHOOK_SECRET_MISSING");

  const adapter = getBillingAdapter(provider.adapter_type);
  const event = await adapter.parseWebhook(
    secrets.apiSecret,
    secrets.webhookSecret,
    rawBody,
    headers,
  );

  const { data: claimed, error: claimError } = await supabase.rpc(
    "claim_billing_event",
    {
      p_provider_id: provider.id,
      p_external_event_id: event.externalEventId,
      p_event_type: event.externalEventType,
      p_payload: event.raw,
    },
  );

  if (claimError) throw new Error(claimError.message);
  if (!claimed) return;

  try {
    await processNormalizedEvent(
      provider.id,
      secrets.apiSecret,
      provider.adapter_type,
      event,
    );

    const { error } = await supabase
      .from("billing_events")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("billing_provider_id", provider.id)
      .eq("external_event_id", event.externalEventId);
    if (error) throw new Error(error.message);
  } catch (error) {
    const message = error instanceof Error ? error.message : "BILLING_EVENT_FAILED";
    await supabase
      .from("billing_events")
      .update({ status: "failed", error_message: message.slice(0, 2000) })
      .eq("billing_provider_id", provider.id)
      .eq("external_event_id", event.externalEventId);
    throw error;
  }
}
