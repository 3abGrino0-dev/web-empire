import type { AiProviderAdapter } from "@/ai/adapters/types";
import { readError, toJsonValue } from "@/ai/adapters/helpers";

export const openAiResponsesAdapter: AiProviderAdapter = {
  async execute(input) {
    const url = `${input.provider.base_url ?? "https://api.openai.com/v1"}/responses`;
    const body: Record<string, unknown> = {
      model: input.model.model_key,
      instructions: input.systemInstructions || undefined,
      input: input.prompt,
      max_output_tokens: input.maxOutputTokens,
      metadata: input.metadata
    };

    if (input.outputSchema) {
      body.text = {
        format: {
          type: "json_schema",
          name: "web_empire_output",
          strict: true,
          schema: input.outputSchema
        }
      };
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(90_000)
    });

    if (!response.ok) throw new Error(await readError(response));

    const data = (await response.json()) as Record<string, unknown>;
    const outputText = String(data.output_text ?? "");
    const usage = (data.usage ?? {}) as Record<string, unknown>;
    const inputDetails = usage.input_tokens_details as Record<string, unknown> | undefined;

    let parsed: unknown;
    if (input.outputSchema && outputText) {
      try { parsed = JSON.parse(outputText); } catch { parsed = undefined; }
    }

    return {
      text: outputText,
      data: parsed ? toJsonValue(parsed) : undefined,
      providerResponseId: typeof data.id === "string" ? data.id : undefined,
      usage: {
        inputTokens: Number(usage.input_tokens ?? 0),
        outputTokens: Number(usage.output_tokens ?? 0),
        cachedInputTokens: Number(inputDetails?.cached_tokens ?? 0)
      }
    };
  }
};
