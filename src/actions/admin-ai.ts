"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getProviderAdapter } from "@/ai/adapters/registry";
import type { ModelRecord, ProviderRecord } from "@/domain/types";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function cleanMessage(value: unknown) {
  const message =
    value instanceof Error ? value.message : String(value ?? "UNKNOWN_ERROR");

  return message
    .replace(/[\r\n\t]+/g, " ")
    .replace(/[?&#]/g, " ")
    .slice(0, 260);
}

function studioRedirect(params: Record<string, string | number>) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    search.set(key, String(value));
  }

  redirect(`/admin/providers?${search.toString()}`);
}

export async function testAiProviderAction(formData: FormData) {
  await requireAdmin();

  const providerId = String(formData.get("provider_id") ?? "").trim();
  const modelId = String(formData.get("model_id") ?? "").trim();
  const prompt =
    String(formData.get("prompt") ?? "").trim() ||
    "أجب بكلمة واحدة فقط: جاهز";

  if (!providerId || !modelId) {
    studioRedirect({
      test: "error",
      message: "PROVIDER_AND_MODEL_REQUIRED",
    });
  }

  const supabase = createSupabaseAdminClient();

  const [providerResult, modelResult] = await Promise.all([
    supabase.from("ai_providers").select("*").eq("id", providerId).single(),
    supabase.from("ai_models").select("*").eq("id", modelId).single(),
  ]);

  if (providerResult.error || !providerResult.data) {
    studioRedirect({
      test: "error",
      message: providerResult.error?.message ?? "PROVIDER_NOT_FOUND",
    });
  }

  if (modelResult.error || !modelResult.data) {
    studioRedirect({
      test: "error",
      message: modelResult.error?.message ?? "MODEL_NOT_FOUND",
    });
  }

  if (modelResult.data.provider_id !== providerId) {
    studioRedirect({
      test: "error",
      message: "MODEL_PROVIDER_MISMATCH",
    });
  }

  if (!providerResult.data.is_active) {
    studioRedirect({
      test: "error",
      message: "PROVIDER_IS_INACTIVE",
    });
  }

  if (!modelResult.data.is_active) {
    studioRedirect({
      test: "error",
      message: "MODEL_IS_INACTIVE",
    });
  }

  const secretResult = await supabase.rpc("get_ai_provider_secret", {
    p_provider_id: providerId,
  });

  if (secretResult.error || !secretResult.data) {
    studioRedirect({
      test: "error",
      provider: providerResult.data.name,
      model: modelResult.data.name,
      message: secretResult.error?.message ?? "PROVIDER_SECRET_MISSING",
    });
  }

  const provider = providerResult.data as ProviderRecord;
  const model = modelResult.data as ModelRecord;
  const startedAt = Date.now();

  try {
    const adapter = getProviderAdapter(provider.adapter_type);
    const result = await adapter.execute({
      provider,
      model,
      apiKey: String(secretResult.data),
      systemInstructions:
        "أنت اختبار اتصال تقني. أجب بإيجاز شديد ولا تعرض أي معلومات سرية.",
      prompt,
      maxOutputTokens: Math.min(128, model.max_output_tokens || 128),
      metadata: {
        web_empire_test: "provider_studio",
        web_empire_provider: provider.slug,
        web_empire_model: model.model_key,
      },
    });

    const latencyMs = Date.now() - startedAt;
    const output = (result.text || JSON.stringify(result.data ?? {}))
      .replace(/[\r\n\t]+/g, " ")
      .slice(0, 420);

    studioRedirect({
      test: "success",
      provider: provider.name,
      model: model.name,
      latency_ms: latencyMs,
      input_tokens: result.usage.inputTokens,
      output_tokens: result.usage.outputTokens,
      response: output || "EMPTY_PROVIDER_RESPONSE",
    });
  } catch (error) {
    studioRedirect({
      test: "error",
      provider: provider.name,
      model: model.name,
      latency_ms: Date.now() - startedAt,
      message: cleanMessage(error),
    });
  }
}

export async function updateAiProviderSecretAction(formData: FormData) {
  await requireAdmin();

  const providerId = String(formData.get("provider_id") ?? "").trim();
  const apiKey = String(formData.get("api_key") ?? "").trim();

  if (!providerId || !apiKey) {
    studioRedirect({
      secret: "error",
      message: "PROVIDER_AND_API_KEY_REQUIRED",
    });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.rpc("set_ai_provider_secret", {
    p_provider_id: providerId,
    p_secret: apiKey,
  });

  if (error) {
    studioRedirect({
      secret: "error",
      message: cleanMessage(error),
    });
  }

  revalidatePath("/admin/providers");
  studioRedirect({
    secret: "success",
    message: "API_KEY_SAVED",
  });
}

export async function toggleAiProviderAction(formData: FormData) {
  await requireAdmin();

  const providerId = String(formData.get("provider_id") ?? "").trim();
  const nextState = String(formData.get("next_state") ?? "") === "true";

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("ai_providers")
    .update({ is_active: nextState })
    .eq("id", providerId);

  if (error) {
    studioRedirect({
      update: "error",
      message: cleanMessage(error),
    });
  }

  revalidatePath("/admin/providers");
  studioRedirect({
    update: "success",
    message: nextState ? "PROVIDER_ACTIVATED" : "PROVIDER_DISABLED",
  });
}

export async function toggleAiModelAction(formData: FormData) {
  await requireAdmin();

  const modelId = String(formData.get("model_id") ?? "").trim();
  const nextState = String(formData.get("next_state") ?? "") === "true";

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("ai_models")
    .update({ is_active: nextState })
    .eq("id", modelId);

  if (error) {
    studioRedirect({
      update: "error",
      message: cleanMessage(error),
    });
  }

  revalidatePath("/admin/providers");
  studioRedirect({
    update: "success",
    message: nextState ? "MODEL_ACTIVATED" : "MODEL_DISABLED",
  });
}
