import type {
  CheckoutInput,
  CheckoutResult,
  NormalizedBillingEvent,
  SubscriptionSnapshot,
} from "@/billing/types";

export interface BillingAdapter {
  createCheckout(input: CheckoutInput): Promise<CheckoutResult>;
  parseWebhook(
    apiSecret: string,
    webhookSecret: string,
    rawBody: string,
    headers: Headers,
  ): Promise<NormalizedBillingEvent>;
  retrieveSubscription(
    apiSecret: string,
    subscriptionId: string,
  ): Promise<SubscriptionSnapshot>;
}
