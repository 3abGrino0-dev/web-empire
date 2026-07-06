import Stripe from "stripe";

import type { BillingAdapter } from "@/billing/adapters/types";
import type {
  NormalizedBillingEvent,
  SubscriptionSnapshot,
} from "@/billing/types";
import { publicEnv } from "@/lib/env";

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function text(value: unknown): string | undefined {
  if (typeof value === "string" && value) return value;
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;
    return typeof id === "string" ? id : undefined;
  }
  return undefined;
}

function unixDate(value: unknown): string | undefined {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0
    ? new Date(numeric * 1000).toISOString()
    : undefined;
}

function getMetadata(value: unknown): Record<string, string> {
  const source = record(record(value).metadata);
  return Object.fromEntries(
    Object.entries(source)
      .filter(([, item]) => typeof item === "string")
      .map(([key, item]) => [key, String(item)]),
  );
}

function extractInvoiceSubscription(invoice: Record<string, unknown>): string | undefined {
  const direct = text(invoice.subscription);
  if (direct) return direct;

  const parent = record(invoice.parent);
  const subscriptionDetails = record(parent.subscription_details);
  return text(subscriptionDetails.subscription);
}

function normalizeSubscription(value: unknown): SubscriptionSnapshot {
  const subscription = record(value);
  const metadata = getMetadata(subscription);

  return {
    userId: metadata.web_empire_user_id,
    planId: metadata.web_empire_plan_id,
    customerId: text(subscription.customer),
    subscriptionId: text(subscription.id) ?? "",
    status: String(subscription.status ?? "inactive"),
    periodStart: unixDate(subscription.current_period_start),
    periodEnd: unixDate(subscription.current_period_end),
    cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
  };
}

export const stripeCheckoutAdapter: BillingAdapter = {
  async createCheckout(input) {
    const stripe = new Stripe(input.apiSecret);
    const metadata = {
      web_empire_user_id: input.userId,
      web_empire_plan_id: input.planId,
      web_empire_provider_id: input.provider.id,
    };

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: input.externalPriceId, quantity: 1 }],
      success_url: `${publicEnv.siteUrl}/${input.locale}/dashboard?billing=success`,
      cancel_url: `${publicEnv.siteUrl}/${input.locale}/pricing?billing=cancelled`,
      customer_email: input.userEmail,
      client_reference_id: input.userId,
      metadata,
      subscription_data: { metadata },
      allow_promotion_codes: true,
    });

    if (!session.url) throw new Error("STRIPE_CHECKOUT_URL_MISSING");

    return {
      url: session.url,
      externalSessionId: session.id,
    };
  },

  async parseWebhook(apiSecret, webhookSecret, rawBody, headers) {
    const stripe = new Stripe(apiSecret);
    const signature = headers.get("stripe-signature");
    if (!signature) throw new Error("STRIPE_SIGNATURE_MISSING");

    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    const object = record(event.data.object as unknown);
    const metadata = getMetadata(object);
    const base = {
      externalEventId: event.id,
      externalEventType: event.type,
      raw: JSON.parse(JSON.stringify(event)) as Record<string, unknown>,
    };

    if (event.type === "checkout.session.completed") {
      return {
        ...base,
        type: "checkout_completed",
        userId: metadata.web_empire_user_id ?? text(object.client_reference_id),
        planId: metadata.web_empire_plan_id,
        customerId: text(object.customer),
        subscriptionId: text(object.subscription),
      } satisfies NormalizedBillingEvent;
    }

    if (event.type === "invoice.paid") {
      return {
        ...base,
        type: "invoice_paid",
        invoiceId: text(object.id),
        customerId: text(object.customer),
        subscriptionId: extractInvoiceSubscription(object),
      } satisfies NormalizedBillingEvent;
    }

    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.created"
    ) {
      const snapshot = normalizeSubscription(object);
      return {
        ...base,
        type: "subscription_updated",
        ...snapshot,
        subscriptionStatus: snapshot.status,
      } satisfies NormalizedBillingEvent;
    }

    if (event.type === "customer.subscription.deleted") {
      const snapshot = normalizeSubscription(object);
      return {
        ...base,
        type: "subscription_deleted",
        ...snapshot,
        subscriptionStatus: "canceled",
      } satisfies NormalizedBillingEvent;
    }

    return { ...base, type: "ignored" } satisfies NormalizedBillingEvent;
  },

  async retrieveSubscription(apiSecret, subscriptionId) {
    const stripe = new Stripe(apiSecret);
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return normalizeSubscription(subscription as unknown);
  },
};
