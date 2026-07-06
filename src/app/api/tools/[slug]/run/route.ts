import { NextResponse } from "next/server";

import { runTool } from "@/engines/tool-runner";

const MAX_REQUEST_BYTES = 1_000_000;

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > MAX_REQUEST_BYTES) {
      return NextResponse.json({ error: "REQUEST_TOO_LARGE" }, { status: 413 });
    }

    const { slug } = await context.params;
    const body = (await request.json()) as {
      input?: Record<string, unknown>;
      locale?: string;
    };

    const result = await runTool(slug, body.input ?? {}, body.locale ?? "en");
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "TOOL_RUN_FAILED";
    const status =
      message === "LOGIN_REQUIRED"
        ? 401
        : message === "INSUFFICIENT_CREDITS"
          ? 402
          : message === "PLAN_REQUIRED" ||
              message === "TOOL_NOT_INCLUDED_IN_PLAN" ||
              message === "DAILY_TOOL_LIMIT_REACHED"
            ? 403
            : 400;

    return NextResponse.json(
      {
        error:
          message === "LOGIN_REQUIRED"
            ? "سجل الدخول لاستخدام هذه الأداة."
            : message,
      },
      { status },
    );
  }
}
