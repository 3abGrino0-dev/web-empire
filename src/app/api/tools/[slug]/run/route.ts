import { runTool } from "@/engines/tool-runner";
import { corsJson, corsOptions } from "@/lib/api-cors";
import { getRequestUserId } from "@/lib/request-auth";

const MAX_REQUEST_BYTES = 1_000_000;

export function OPTIONS() {
  return corsOptions();
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > MAX_REQUEST_BYTES) {
      return corsJson({ error: "REQUEST_TOO_LARGE" }, { status: 413 });
    }

    const { slug } = await context.params;
    const userId = await getRequestUserId(request);
    const hasBearer = /^Bearer\s+/i.test(request.headers.get("authorization") ?? "");
    if (hasBearer && !userId) {
      return corsJson({ error: "INVALID_ACCESS_TOKEN" }, { status: 401 });
    }

    const body = (await request.json()) as {
      input?: Record<string, unknown>;
      locale?: string;
    };

    const result = await runTool(
      slug,
      body.input ?? {},
      body.locale ?? "en",
      userId ?? undefined,
    );
    return corsJson(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "TOOL_RUN_FAILED";
    const status =
      message === "LOGIN_REQUIRED" || message === "INVALID_ACCESS_TOKEN"
        ? 401
        : message === "INSUFFICIENT_CREDITS"
          ? 402
          : message === "PLAN_REQUIRED" ||
              message === "TOOL_NOT_INCLUDED_IN_PLAN" ||
              message === "DAILY_TOOL_LIMIT_REACHED"
            ? 403
            : 400;

    return corsJson(
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
