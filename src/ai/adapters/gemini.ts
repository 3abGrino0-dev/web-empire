import type { AiProviderAdapter } from "@/ai/adapters/types";
import { readError, toJsonValue } from "@/ai/adapters/helpers";

export const geminiAdapter: AiProviderAdapter = {
  async execute(input) {
    const base = input.provider.base_url ?? "https://generativelanguage.googleapis.com/v1beta";
    const url = `${base}/models/${encodeURIComponent(input.model.model_key)}:generateContent`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "x-goog-api-key": input.apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        system_instruction: input.systemInstructions
          ? { parts: [{ text: input.systemInstructions }] }
          : undefined,
        contents: [{ role: "user", parts: [{ text: input.prompt }] }],
        generationConfig: {
          maxOutputTokens: input.maxOutputTokens,
          responseMimeType: input.outputSchema ? "application/json" : "text/plain",
          responseJsonSchema: input.outputSchema || undefined
        }
      }),
      signal: AbortSignal.timeout(90_000)
    });

    if (!response.ok) throw new Error(await readError(response));

    const data = (await response.json()) as Record<string, unknown>;
    const candidates = Array.isArray(data.candidates) ? data.candidates : [];
    const first = candidates[0] as Record<string, unknown> | undefined;
    const content = first?.content as Record<string, unknown> | undefined;
    const parts = Array.isArray(content?.parts) ? content.parts : [];
    const text = parts.map((part) =>
      part && typeof part === "object"
        ? String((part as Record<string, unknown>).text ?? "")
        : ""
    ).join("\n");

    const usage = (data.usageMetadata ?? {}) as Record<string, unknown>;
    let parsed: unknown;
    if (input.outputSchema && text) {
      try { parsed = JSON.parse(text); } catch { parsed = undefined; }
    }

    return {
      text,
      data: parsed ? toJsonValue(parsed) : undefined,
      usage: {
        inputTokens: Number(usage.promptTokenCount ?? 0),
        outputTokens: Number(usage.candidatesTokenCount ?? 0),
        cachedInputTokens: Number(usage.cachedContentTokenCount ?? 0)
      }
    };
  }
};
