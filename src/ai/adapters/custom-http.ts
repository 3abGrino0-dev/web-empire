import type { AiProviderAdapter } from "@/ai/adapters/types";
import { getByPath, readError, toJsonValue } from "@/ai/adapters/helpers";
import { renderTemplate } from "@/lib/template";

export const customHttpAdapter: AiProviderAdapter = {
  async execute(input) {
    if (!input.provider.base_url) throw new Error("Provider base URL is required.");

    const config = input.provider.config;
    const endpoint = String(config.endpoint ?? "");
    const method = String(config.method ?? "POST").toUpperCase();
    const authHeader = String(config.auth_header ?? "Authorization");
    const authPrefix = String(config.auth_prefix ?? "Bearer ");
    const textPath = String(config.text_path ?? "output.text");
    const inputTokensPath = String(config.input_tokens_path ?? "usage.input_tokens");
    const outputTokensPath = String(config.output_tokens_path ?? "usage.output_tokens");
    const bodyTemplate = String(
      config.body_template ??
      '{"model":"{{model}}","prompt":"{{prompt}}","system":"{{system}}"}'
    );

    const rendered = renderTemplate(bodyTemplate, {
      model: input.model.model_key,
      prompt: input.prompt,
      system: input.systemInstructions,
      max_output_tokens: input.maxOutputTokens
    });

    let body: unknown;
    try { body = JSON.parse(rendered); }
    catch { throw new Error("Custom HTTP body_template must render valid JSON."); }

    const response = await fetch(`${input.provider.base_url}${endpoint}`, {
      method,
      headers: {
        [authHeader]: `${authPrefix}${input.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(90_000)
    });

    if (!response.ok) throw new Error(await readError(response));

    const data = (await response.json()) as Record<string, unknown>;
    return {
      text: String(getByPath(data, textPath) ?? ""),
      raw: toJsonValue(data),
      usage: {
        inputTokens: Number(getByPath(data, inputTokensPath) ?? 0),
        outputTokens: Number(getByPath(data, outputTokensPath) ?? 0)
      }
    };
  }
};
