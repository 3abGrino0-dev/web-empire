import type { ProviderAdapterType } from "@/domain/types";
import type { AiProviderAdapter } from "@/ai/adapters/types";
import { anthropicMessagesAdapter } from "@/ai/adapters/anthropic";
import { customHttpAdapter } from "@/ai/adapters/custom-http";
import { geminiAdapter } from "@/ai/adapters/gemini";
import { openAiResponsesAdapter } from "@/ai/adapters/openai";
import { openAiCompatibleAdapter } from "@/ai/adapters/openai-compatible";

const adapters: Record<ProviderAdapterType, AiProviderAdapter> = {
  openai_responses: openAiResponsesAdapter,
  anthropic_messages: anthropicMessagesAdapter,
  gemini_generate_content: geminiAdapter,
  openai_compatible: openAiCompatibleAdapter,
  custom_http: customHttpAdapter
};

export function getProviderAdapter(type: ProviderAdapterType): AiProviderAdapter {
  return adapters[type];
}
