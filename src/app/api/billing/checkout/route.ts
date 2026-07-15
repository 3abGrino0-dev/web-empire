import { z } from "zod";

import { createBillingCheckout } from "@/billing/service";
import { corsJson, corsOptions } from "@/lib/api-cors";
import { getRequestUserId } from "@/lib/request-auth";
import { getLocaleByCode } from "@/localization/repository";

const requestSchema = z.object({
  planId: z.string().uuid(),
  locale: z.string().min(2).max(12),
});

export function OPTIONS() {
  return corsOptions();
}

export async function POST(request: Request) {
  try {
    const userId = await getRequestUserId(request);
    if (!userId) return corsJson({ error: "LOGIN_REQUIRED" }, { status: 401 });

    const body = requestSchema.parse(await request.json());
    const locale = await getLocaleByCode(body.locale);
    if (!locale) return corsJson({ error: "LOCALE_NOT_SUPPORTED" }, { status: 400 });

    const result = await createBillingCheckout(userId, body.planId, locale.code);
    return corsJson(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "CHECKOUT_FAILED";
    return corsJson({ error: message }, { status: 400 });
  }
}
