import type { AiProviderAdapter } from "@/ai/adapters/types";
import { readError } from "@/ai/adapters/helpers";

export const openAiCompatibleAdapter: AiProviderAdapter = {
  async execute(input) {
    if (!input.provider.base_url) throw new Error("Provider base URL is required.");

    const response = await fetch(`${input.provider.base_url}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: input.model.model_key,
        max_tokens: input.maxOutputTokens,
        messages: [
          ...(input.systemInstructions
            ? [{ role: "system", content: input.systemInstructions }]
            : []),
          { role: "user", content: input.prompt }
        ]
      }),
      signal: AbortSignal.timeout(90_000)
    });

    if (!response.ok) throw new Error(await readError(response));

    const data = (await response.json()) as Record<string, unknown>;
    const choices = Array.isArray(data.choices) ? data.choices : [];
    const first = choices[0] as Record<string, unknown> | undefined;
    const message = first?.message as Record<string, unknown> | undefined;
    const usage = (data.usage ?? {}) as Record<string, unknown>;

    return {
      text: String(message?.content ?? ""),
      providerResponseId: typeof data.id === "string" ? data.id : undefined,
      usage: {
        inputTokens: Number(usage.prompt_tokens ?? 0),
        outputTokens: Number(usage.completion_tokens ?? 0),
        cachedInputTokens: 0
      }
    };
  }
};
