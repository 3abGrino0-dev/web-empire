import { NextResponse } from "next/server";
import { z } from "zod";

import { createChatStreamResponse } from "@/ai/chat/service";
import {
  createStreamingAssistantMessage,
  getUserChatMessages,
  getUserChatThread,
} from "@/ai/chat/repository";
import { normalizeLocale } from "@/lib/auth/redirects";
import { getRequestUserId } from "@/lib/request-auth";

const MAX_REQUEST_BYTES = 100_000;

const paramsSchema = z.object({ threadId: z.uuid() });
const bodySchema = z.object({ locale: z.string().optional() });

export async function POST(
  request: Request,
  context: { params: Promise<{ threadId: string }> },
) {
  try {
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > MAX_REQUEST_BYTES) {
      return NextResponse.json({ error: "REQUEST_TOO_LARGE" }, { status: 413 });
    }

    const userId = await getRequestUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "LOGIN_REQUIRED" }, { status: 401 });
    }

    const { threadId } = paramsSchema.parse(await context.params);
    const body = bodySchema.parse(await request.json().catch(() => ({})));
    const localeCode = normalizeLocale(body.locale);

    const thread = await getUserChatThread(userId, threadId);
    if (!thread) {
      return NextResponse.json({ error: "AI_CHAT_THREAD_NOT_FOUND" }, { status: 404 });
    }

    const messages = await getUserChatMessages(userId, threadId);
    const latestAssistantIndex = [...messages].map((message) => message.role).lastIndexOf("assistant");
    const searchEnd = latestAssistantIndex >= 0 ? latestAssistantIndex : messages.length;
    const retryUserIndex = messages
      .slice(0, searchEnd)
      .map((message) => message.role)
      .lastIndexOf("user");

    if (retryUserIndex < 0) {
      return NextResponse.json({ error: "AI_CHAT_RETRY_NOT_AVAILABLE" }, { status: 400 });
    }

    const historyMessages = messages.slice(0, retryUserIndex + 1);

    let assistantMessage;
    try {
      assistantMessage = await createStreamingAssistantMessage({ userId, threadId });
    } catch (error) {
      if (error instanceof Error && error.message === "AI_CHAT_ALREADY_STREAMING") {
        return NextResponse.json({ error: "AI_CHAT_ALREADY_STREAMING" }, { status: 409 });
      }
      throw error;
    }

    return createChatStreamResponse({
      userId,
      thread,
      historyMessages,
      assistantMessage,
      localeCode,
      requestSignal: request.signal,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "INVALID_CHAT_REQUEST" }, { status: 400 });
    }

    return NextResponse.json({ error: "AI_CHAT_RETRY_FAILED" }, { status: 400 });
  }
}