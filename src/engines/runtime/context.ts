import type { JsonValue } from "@/domain/types";

export interface WorkflowContext {
  input: Record<string, unknown>;
  steps: Record<string, { text?: string; data?: JsonValue }>;
}

export function getContextValue(context: WorkflowContext, path: string): unknown {
  const normalized = path.replace(/^\$\.?/, "");
  if (!normalized) return context;

  return normalized.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object") {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, context);
}

export function renderContextTemplate(
  template: string,
  context: WorkflowContext,
): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_, path: string) => {
    const value = getContextValue(context, path);
    if (value === undefined || value === null) return "";
    return typeof value === "object" ? JSON.stringify(value) : String(value);
  });
}

export function mapContextObject(
  mapping: Record<string, unknown>,
  context: WorkflowContext,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(mapping).map(([key, value]) => {
      if (typeof value === "string" && value.startsWith("$")) {
        return [key, getContextValue(context, value)];
      }
      if (typeof value === "string") {
        return [key, renderContextTemplate(value, context)];
      }
      return [key, value];
    }),
  );
}
