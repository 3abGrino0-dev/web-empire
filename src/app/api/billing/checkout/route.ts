import { NextResponse } from "next/server";
import { z } from "zod";

import { createBillingCheckout } from "@/billing/service";
import { getRequestUserId } from "@/lib/request-auth";
import { getLocaleByCode } from "@/localization/repository";

const requestSchema = z.object({
  planId: z.string().uuid(),
  locale: z.string().min(2).max(12),
});

export async function POST(request: Request) {
  try {
    const userId = await getRequestUserId(request);
    if (!userId) return NextResponse.json({ error: "LOGIN_REQUIRED" }, { status: 401 });

    const body = requestSchema.parse(await request.json());
    const locale = await getLocaleByCode(body.locale);
    if (!locale) return NextResponse.json({ error: "LOCALE_NOT_SUPPORTED" }, { status: 400 });

    const result = await createBillingCheckout(userId, body.planId, locale.code);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "CHECKOUT_FAILED";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
