import { NextResponse } from "next/server";
import { z } from "zod";

import {
  deleteUserChatThread,
  getUserChatMessages,
  getUserChatThread,
} from "@/ai/chat/repository";
import { getRequestUserId } from "@/lib/request-auth";

const paramsSchema = z.object({ threadId: z.uuid() });

export async function GET(
  request: Request,
  context: { params: Promise<{ threadId: string }> },
) {
  try {
    const userId = await getRequestUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "LOGIN_REQUIRED" }, { status: 401 });
    }

    const { threadId } = paramsSchema.parse(await context.params);
    const thread = await getUserChatThread(userId, threadId);
    if (!thread) {
      return NextResponse.json({ error: "AI_CHAT_THREAD_NOT_FOUND" }, { status: 404 });
    }

    const messages = await getUserChatMessages(userId, threadId);
    return NextResponse.json({ thread, messages });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "INVALID_THREAD_ID" }, { status: 400 });
    }

    return NextResponse.json({ error: "AI_CHAT_THREAD_READ_FAILED" }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ threadId: string }> },
) {
  try {
    const userId = await getRequestUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "LOGIN_REQUIRED" }, { status: 401 });
    }

    const { threadId } = paramsSchema.parse(await context.params);
    await deleteUserChatThread(userId, threadId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "INVALID_THREAD_ID" }, { status: 400 });
    }

    const code = error instanceof Error ? error.message : "AI_CHAT_THREAD_DELETE_FAILED";
    const status = code === "AI_CHAT_THREAD_NOT_FOUND" ? 404 : 400;
    return NextResponse.json({ error: code }, { status });
  }
}
