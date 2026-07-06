import type { JsonValue } from "@/domain/types";

export function getByPath(value: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object") {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, value);
}

export function toJsonValue(value: unknown): JsonValue {
  return JSON.parse(JSON.stringify(value)) as JsonValue;
}

export async function readError(response: Response): Promise<string> {
  const text = await response.text();
  return text.slice(0, 1000) || `HTTP ${response.status}`;
}
