import type { BillingAdapter } from "@/billing/adapters/types";
import { stripeCheckoutAdapter } from "@/billing/adapters/stripe";
import type { BillingAdapterType } from "@/billing/types";

const adapters: Record<BillingAdapterType, BillingAdapter> = {
  stripe_checkout: stripeCheckoutAdapter,
};

export function getBillingAdapter(type: BillingAdapterType): BillingAdapter {
  return adapters[type];
}
