import "server-only";

import type { JsonValue } from "@/domain/types";
import { getByPath, toJsonValue } from "@/ai/adapters/helpers";
import { getRuntimeConnection } from "@/engines/runtime/connections";
import {
  renderContextTemplate,
  type WorkflowContext,
} from "@/engines/runtime/context";

export interface HttpRuntimeConfig {
  connection_id: string;
  path: string;
  method?: string;
  headers?: Record<string, string>;
  body_template?: string;
  text_path?: string;
  data_path?: string;
  timeout_ms?: number;
}

export interface HttpRuntimeResult {
  text: string;
  data?: JsonValue;
  status: number;
}

function safeRelativePath(path: string): string {
  const value = path.trim();
  if (!value.startsWith("/")) throw new Error("HTTP_RUNTIME_RELATIVE_PATH_REQUIRED");
  if (value.startsWith("//") || value.includes("://")) {
    throw new Error("HTTP_RUNTIME_ABSOLUTE_URL_BLOCKED");
  }
  return value;
}

async function readResponseBody(response: Response): Promise<unknown> {
  const declaredLength = Number(response.headers.get("content-length") ?? 0);
  if (declaredLength > 2_000_000) throw new Error("HTTP_RUNTIME_RESPONSE_TOO_LARGE");

  const text = await response.text();
  if (text.length > 2_000_000) throw new Error("HTTP_RUNTIME_RESPONSE_TOO_LARGE");

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(text);
    } catch {
      throw new Error("HTTP_RUNTIME_INVALID_JSON_RESPONSE");
    }
  }

  return text;
}

export async function executeHttpRuntime(
  config: HttpRuntimeConfig,
  context: WorkflowContext,
  forceWebhook = false,
): Promise<HttpRuntimeResult> {
  const { connection, secret } = await getRuntimeConnection(config.connection_id);
  const path = safeRelativePath(renderContextTemplate(config.path, context));
  const url = `${connection.base_url.replace(/\/$/, "")}${path}`;
  const method = forceWebhook ? "POST" : String(config.method ?? "POST").toUpperCase();
  const timeoutMs = Math.min(
    Math.max(Number(config.timeout_ms ?? connection.max_timeout_ms), 1000),
    connection.max_timeout_ms,
    60_000,
  );

  const headers: Record<string, string> = {
    ...connection.default_headers,
    ...(config.headers ?? {}),
  };

  for (const [key, value] of Object.entries(headers)) {
    headers[key] = renderContextTemplate(String(value), context);
  }

  if (secret) {
    headers[connection.auth_header] = `${connection.auth_prefix}${secret}`;
  }

  let body: string | undefined;
  if (!["GET", "HEAD"].includes(method)) {
    const bodyTemplate = config.body_template ?? "{}";
    const renderedBody = renderContextTemplate(bodyTemplate, context);
    try {
      body = JSON.stringify(JSON.parse(renderedBody));
      headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
    } catch {
      throw new Error("HTTP_RUNTIME_BODY_TEMPLATE_INVALID_JSON");
    }
  }

  const response = await fetch(url, {
    method,
    headers,
    body,
    signal: AbortSignal.timeout(timeoutMs),
    redirect: "error",
    cache: "no-store",
  });

  const payload = await readResponseBody(response);

  if (!response.ok) {
    const message = typeof payload === "string" ? payload : JSON.stringify(payload);
    throw new Error(`HTTP_RUNTIME_${response.status}: ${message.slice(0, 800)}`);
  }

  const textValue = config.text_path
    ? getByPath(payload, config.text_path)
    : typeof payload === "string"
      ? payload
      : undefined;

  const dataValue = config.data_path ? getByPath(payload, config.data_path) : payload;

  return {
    text: textValue === undefined ? "" : String(textValue),
    data: dataValue === undefined ? undefined : toJsonValue(dataValue),
    status: response.status,
  };
}
