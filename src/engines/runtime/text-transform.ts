import type { JsonValue, ToolRecord } from "@/domain/types";

interface TransformOperation {
  type: "trim" | "uppercase" | "lowercase" | "collapse_whitespace" | "prefix" | "suffix";
  value?: string;
}

export function executeTextTransform(
  tool: ToolRecord,
  input: Record<string, unknown>,
): { text: string; data: JsonValue } {
  const inputKey = String(tool.runtime_config.input_key ?? "text");
  const rawOperations = tool.runtime_config.operations;
  const operations = Array.isArray(rawOperations)
    ? (rawOperations as unknown as TransformOperation[])
    : [];

  let text = String(input[inputKey] ?? "");

  for (const operation of operations.slice(0, 20)) {
    if (operation.type === "trim") text = text.trim();
    if (operation.type === "uppercase") text = text.toUpperCase();
    if (operation.type === "lowercase") text = text.toLowerCase();
    if (operation.type === "collapse_whitespace") text = text.replace(/\s+/g, " ").trim();
    if (operation.type === "prefix") text = `${operation.value ?? ""}${text}`;
    if (operation.type === "suffix") text = `${text}${operation.value ?? ""}`;
  }

  return { text, data: { text } };
}
