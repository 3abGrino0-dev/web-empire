export type BillingAdapterType = "stripe_checkout";

export interface BillingProviderRecord {
  id: string;
  name: string;
  slug: string;
  adapter_type: BillingAdapterType;
  config: Record<string, unknown>;
  priority: number;
  is_active: boolean;
}

export interface BillingProviderSecrets {
  apiSecret: string;
  webhookSecret: string;
}

export interface CheckoutInput {
  provider: BillingProviderRecord;
  apiSecret: string;
  externalPriceId: string;
  userId: string;
  userEmail?: string;
  planId: string;
  locale: string;
}

export interface CheckoutResult {
  url: string;
  externalSessionId: string;
}

export type NormalizedBillingEventType =
  | "checkout_completed"
  | "invoice_paid"
  | "subscription_updated"
  | "subscription_deleted"
  | "ignored";

export interface NormalizedBillingEvent {
  externalEventId: string;
  externalEventType: string;
  type: NormalizedBillingEventType;
  raw: Record<string, unknown>;
  userId?: string;
  planId?: string;
  customerId?: string;
  subscriptionId?: string;
  invoiceId?: string;
  subscriptionStatus?: string;
  periodStart?: string;
  periodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export interface SubscriptionSnapshot {
  userId?: string;
  planId?: string;
  customerId?: string;
  subscriptionId: string;
  status: string;
  periodStart?: string;
  periodEnd?: string;
  cancelAtPeriodEnd: boolean;
}
