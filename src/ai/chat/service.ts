import "server-only";

import { buildGeminiChatContents } from "@/ai/chat/gemini-contents";
import {
  completeAssistantMessage,
  failAssistantMessage,
  recordChatUsage,
  stopAssistantMessage,
} from "@/ai/chat/repository";
import { streamGeminiChat } from "@/ai/chat/gemini-stream";
import { getChatSystemInstruction } from "@/ai/chat/system-instructions";
import type { ChatMessage, ChatThread } from "@/ai/chat/types";
import { getProviderCandidatesByAlias } from "@/ai/providers";
import { providerCostSar } from "@/credits/pricing";
import type { ProviderUsage } from "@/domain/types";

const USD_TO_SAR = 3.75;

function toSseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  );
}

function hasUsageData(usage: ProviderUsage): boolean {
  return Boolean(
    usage.inputTokens || usage.outputTokens || usage.cachedInputTokens,
  );
}

export function createChatStreamResponse({
  userId,
  thread,
  historyMessages,
  assistantMessage,
  localeCode,
  requestSignal,
}: {
  userId: string;
  thread: ChatThread;
  historyMessages: ChatMessage[];
  assistantMessage: ChatMessage;
  localeCode: string;
  requestSignal: AbortSignal;
}): Response {
  const encoder = new TextEncoder();

  return new Response(
    new ReadableStream({
      async start(controller) {
        const emit = (event: string, data: unknown) => {
          controller.enqueue(encoder.encode(toSseEvent(event, data)));
        };

        emit("meta", { threadId: thread.id, messageId: assistantMessage.id });

        const candidates = await getProviderCandidatesByAlias({
          modelAlias: thread.modelAlias,
          providerStrategy: thread.providerStrategy,
        });

        if (!candidates.length) {
          await failAssistantMessage({
            userId,
            threadId: thread.id,
            messageId: assistantMessage.id,
            content: "",
            errorCode: "AI_CHAT_PROVIDER_NOT_AVAILABLE",
          });
          emit("error", { code: "AI_CHAT_PROVIDER_NOT_AVAILABLE" });
          controller.close();
          return;
        }

        const providerMessages = buildGeminiChatContents(historyMessages);
        const upstreamController = new AbortController();
        requestSignal.addEventListener("abort", () => upstreamController.abort(), { once: true });

        let assistantText = "";
        let usage: ProviderUsage = {
          inputTokens: 0,
          outputTokens: 0,
          cachedInputTokens: 0,
        };
        let usageSeen = false;
        let selectedProviderId: string | null = null;
        let selectedModelId: string | null = null;
        let lastErrorCode = "AI_CHAT_FAILED";

        for (const candidate of candidates) {
          try {
            selectedProviderId = candidate.provider.id;
            selectedModelId = candidate.model.id;

            const result = await streamGeminiChat({
              candidate,
              systemInstruction: getChatSystemInstruction(localeCode),
              contents: providerMessages,
              maxOutputTokens: Math.min(8192, candidate.model.max_output_tokens),
              signal: upstreamController.signal,
              onText(deltaText) {
                assistantText += deltaText;
                emit("delta", { text: deltaText });
              },
              onUsage(nextUsage) {
                usage = nextUsage;
                usageSeen = true;
                emit("usage", {
                  inputTokens: nextUsage.inputTokens,
                  outputTokens: nextUsage.outputTokens,
                  cachedInputTokens: nextUsage.cachedInputTokens ?? 0,
                });
              },
            });

            usage = result.usage;
            usageSeen ||= hasUsageData(result.usage);

            await completeAssistantMessage({
              userId,
              threadId: thread.id,
              messageId: assistantMessage.id,
              content: assistantText,
              providerId: selectedProviderId,
              modelId: selectedModelId,
            });

            if (usageSeen && selectedProviderId && selectedModelId) {
              const estimatedCostUsd =
                providerCostSar(candidate.model, usage) / USD_TO_SAR;
              await recordChatUsage({
                userId,
                threadId: thread.id,
                messageId: assistantMessage.id,
                providerId: selectedProviderId,
                modelId: selectedModelId,
                inputTokens: usage.inputTokens,
                outputTokens: usage.outputTokens,
                cachedInputTokens: usage.cachedInputTokens ?? 0,
                estimatedCostUsd,
                creditsCharged: 0,
              });
            }

            emit("done", { messageId: assistantMessage.id });
            controller.close();
            return;
          } catch (error) {
            if (isAbortError(error) || requestSignal.aborted) {
              await stopAssistantMessage({
                userId,
                threadId: thread.id,
                messageId: assistantMessage.id,
                content: assistantText,
                providerId: selectedProviderId,
                modelId: selectedModelId,
                errorCode: "AI_CHAT_ABORTED",
              });

              if (usageSeen && selectedProviderId && selectedModelId) {
                const candidate = candidates.find((item) => item.model.id === selectedModelId);
                if (candidate) {
                  const estimatedCostUsd =
                    providerCostSar(candidate.model, usage) / USD_TO_SAR;
                  await recordChatUsage({
                    userId,
                    threadId: thread.id,
                    messageId: assistantMessage.id,
                    providerId: selectedProviderId,
                    modelId: selectedModelId,
                    inputTokens: usage.inputTokens,
                    outputTokens: usage.outputTokens,
                    cachedInputTokens: usage.cachedInputTokens ?? 0,
                    estimatedCostUsd,
                    creditsCharged: 0,
                  });
                }
              }

              controller.close();
              return;
            }

            lastErrorCode = error instanceof Error ? error.message : "AI_CHAT_FAILED";
            if (assistantText) {
              await failAssistantMessage({
                userId,
                threadId: thread.id,
                messageId: assistantMessage.id,
                content: assistantText,
                providerId: selectedProviderId,
                modelId: selectedModelId,
                errorCode: "AI_CHAT_FAILED",
              });

              if (usageSeen && selectedProviderId && selectedModelId) {
                const candidate = candidates.find((item) => item.model.id === selectedModelId);
                if (candidate) {
                  const estimatedCostUsd =
                    providerCostSar(candidate.model, usage) / USD_TO_SAR;
                  await recordChatUsage({
                    userId,
                    threadId: thread.id,
                    messageId: assistantMessage.id,
                    providerId: selectedProviderId,
                    modelId: selectedModelId,
                    inputTokens: usage.inputTokens,
                    outputTokens: usage.outputTokens,
                    cachedInputTokens: usage.cachedInputTokens ?? 0,
                    estimatedCostUsd,
                    creditsCharged: 0,
                  });
                }
              }

              emit("error", { code: "AI_CHAT_FAILED" });
              controller.close();
              return;
            }
          }
        }

        await failAssistantMessage({
          userId,
          threadId: thread.id,
          messageId: assistantMessage.id,
          content: assistantText,
          providerId: selectedProviderId,
          modelId: selectedModelId,
          errorCode: lastErrorCode === "AI_CHAT_PROVIDER_FAILED"
            ? "AI_CHAT_PROVIDER_FAILED"
            : "AI_CHAT_FAILED",
        });
        emit("error", {
          code: lastErrorCode === "AI_CHAT_PROVIDER_FAILED"
            ? "AI_CHAT_PROVIDER_FAILED"
            : "AI_CHAT_FAILED",
        });
        controller.close();
      },
    }),
    {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    },
  );
}
