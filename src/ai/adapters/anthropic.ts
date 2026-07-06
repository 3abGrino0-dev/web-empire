import type { AiProviderAdapter } from "@/ai/adapters/types";
import { readError } from "@/ai/adapters/helpers";

export const anthropicMessagesAdapter: AiProviderAdapter = {
  async execute(input) {
    const url = `${input.provider.base_url ?? "https://api.anthropic.com/v1"}/messages`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "x-api-key": input.apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: input.model.model_key,
        max_tokens: input.maxOutputTokens,
        system: input.systemInstructions || undefined,
        messages: [{ role: "user", content: input.prompt }]
      }),
      signal: AbortSignal.timeout(90_000)
    });

    if (!response.ok) throw new Error(await readError(response));

    const data = (await response.json()) as Record<string, unknown>;
    const content = Array.isArray(data.content) ? data.content : [];
    const text = content.map((item) => {
      if (item && typeof item === "object" && "text" in item) {
        return String((item as Record<string, unknown>).text ?? "");
      }
      return "";
    }).join("\n");

    const usage = (data.usage ?? {}) as Record<string, unknown>;

    return {
      text,
      providerResponseId: typeof data.id === "string" ? data.id : undefined,
      usage: {
        inputTokens: Number(usage.input_tokens ?? 0),
        outputTokens: Number(usage.output_tokens ?? 0)
      }
    };
  }
};
