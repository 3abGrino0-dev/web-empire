import { NextResponse } from "next/server";

import { createUserChatThread, listUserChatThreads } from "@/ai/chat/repository";
import { getRequestUserId } from "@/lib/request-auth";
import { normalizeLocale } from "@/lib/auth/redirects";

export async function GET(request: Request) {
  try {
    const userId = await getRequestUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "LOGIN_REQUIRED" }, { status: 401 });
    }

    const threads = await listUserChatThreads(userId);
    return NextResponse.json({ threads });
  } catch {
    return NextResponse.json({ error: "AI_CHAT_THREADS_FAILED" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getRequestUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "LOGIN_REQUIRED" }, { status: 401 });
    }

    const body = (await request.json()) as { locale?: string; modelAlias?: string };
    const localeCode = normalizeLocale(body.locale);
    const modelAlias = typeof body.modelAlias === "string" && body.modelAlias.trim()
      ? body.modelAlias.trim()
      : "standard";

    const thread = await createUserChatThread({
      userId,
      localeCode,
      modelAlias,
      providerStrategy: "primary_with_fallback",
    });

    return NextResponse.json({ thread }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "AI_CHAT_THREAD_CREATE_FAILED" }, { status: 400 });
  }
}
