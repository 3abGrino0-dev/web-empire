import { NextResponse } from "next/server";

import { processBillingWebhook } from "@/billing/service";

export async function POST(
  request: Request,
  context: { params: Promise<{ provider: string }> },
) {
  const { provider } = await context.params;
  const rawBody = await request.text();

  try {
    await processBillingWebhook(provider, rawBody, request.headers);
    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "WEBHOOK_FAILED";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
