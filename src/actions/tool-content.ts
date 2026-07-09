"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

import { requireAdmin } from "@/lib/auth";
import {
  parseSaveToolContentInput,
  parseSaveToolRelatedToolsInput,
} from "@/lib/tool-content-validation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

interface ActionResult {
  ok: boolean;
  error?: string;
}

function safeActionError(code: string): ActionResult {
  return { ok: false, error: code };
}

async function revalidateToolPaths(supabase: ReturnType<typeof createSupabaseAdminClient>, toolId: string) {
  const { data: tool, error: toolError } = await supabase
    .from("tools")
    .select("id, slug")
    .eq("id", toolId)
    .maybeSingle();

  if (toolError || !tool) return;

  revalidatePath("/admin/tools/content");
  revalidatePath(`/admin/tools/${toolId}/content`);
  revalidatePath("/admin/tools");

  const { data: locales } = await supabase
    .from("locales")
    .select("code")
    .eq("is_active", true);

  for (const locale of locales ?? []) {
    revalidatePath(`/${locale.code}/tools/${tool.slug}`);
  }
}

export async function saveToolContentAction(input: unknown): Promise<ActionResult> {
  await requireAdmin();

  let payload: ReturnType<typeof parseSaveToolContentInput>;
  try {
    payload = parseSaveToolContentInput(input);
  } catch (error) {
    if (error instanceof ZodError) return safeActionError("TOOL_CONTENT_VALIDATION_FAILED");
    return safeActionError("TOOL_CONTENT_INVALID_PAYLOAD");
  }

  const supabase = createSupabaseAdminClient();

  const [{ data: tool, error: toolError }, { data: locale, error: localeError }] = await Promise.all([
    supabase
      .from("tools")
      .select("id, slug, title_ar, title_en, short_description, prompt_template")
      .eq("id", payload.tool_id)
      .maybeSingle(),
    supabase
      .from("locales")
      .select("id, code, is_active")
      .eq("id", payload.locale_id)
      .maybeSingle(),
  ]);

  if (toolError) return safeActionError("TOOL_LOOKUP_FAILED");
  if (localeError) return safeActionError("LOCALE_LOOKUP_FAILED");
  if (!tool) return safeActionError("TOOL_NOT_FOUND");
  if (!locale) return safeActionError("LOCALE_NOT_FOUND");
  if (!locale.is_active) return safeActionError("LOCALE_INACTIVE");

  const { data: translation, error: translationLookupError } = await supabase
    .from("tool_translations")
    .select("tool_id, locale_id, title, short_description, prompt_template_override")
    .eq("tool_id", payload.tool_id)
    .eq("locale_id", payload.locale_id)
    .maybeSingle();

  if (translationLookupError) return safeActionError("TOOL_TRANSLATION_LOOKUP_FAILED");

  if (translation) {
    const { error: translationUpdateError } = await supabase
      .from("tool_translations")
      .update({
        seo_title: payload.seo_title || null,
        seo_description: payload.seo_description || null,
        updated_at: new Date().toISOString(),
      })
      .eq("tool_id", payload.tool_id)
      .eq("locale_id", payload.locale_id);

    if (translationUpdateError) return safeActionError("TOOL_TRANSLATION_UPDATE_FAILED");
  } else {
    const inferredTitle = locale.code === "ar" ? tool.title_ar : tool.title_en;
    const { error: translationInsertError } = await supabase
      .from("tool_translations")
      .insert({
        tool_id: payload.tool_id,
        locale_id: payload.locale_id,
        title: inferredTitle,
        short_description: tool.short_description,
        seo_title: payload.seo_title || null,
        seo_description: payload.seo_description || null,
        prompt_template_override: tool.prompt_template,
        updated_at: new Date().toISOString(),
      });

    if (translationInsertError) return safeActionError("TOOL_TRANSLATION_INSERT_FAILED");
  }

  const { error: contentError } = await supabase
    .from("tool_content_translations")
    .upsert({
      tool_id: payload.tool_id,
      locale_id: payload.locale_id,
      primary_keyword: payload.primary_keyword || null,
      secondary_keywords: payload.secondary_keywords,
      what_is: payload.what_is,
      use_cases: payload.use_cases,
      how_to_steps: payload.how_to_steps,
      methodology: payload.methodology,
      example_title: payload.example_title,
      example_content: payload.example_content,
      faq: payload.faq,
      updated_at: new Date().toISOString(),
    });

  if (contentError) return safeActionError("TOOL_CONTENT_SAVE_FAILED");

  await revalidateToolPaths(supabase, payload.tool_id);
  return { ok: true };
}

export async function saveToolRelatedToolsAction(input: unknown): Promise<ActionResult> {
  await requireAdmin();

  let payload: ReturnType<typeof parseSaveToolRelatedToolsInput>;
  try {
    payload = parseSaveToolRelatedToolsInput(input);
  } catch (error) {
    if (error instanceof ZodError) return safeActionError("TOOL_RELATED_VALIDATION_FAILED");
    return safeActionError("TOOL_RELATED_INVALID_PAYLOAD");
  }

  if (payload.related_tool_ids.includes(payload.tool_id)) {
    return safeActionError("TOOL_RELATED_SELF_REFERENCE");
  }

  const supabase = createSupabaseAdminClient();

  const { data: sourceTool, error: sourceError } = await supabase
    .from("tools")
    .select("id")
    .eq("id", payload.tool_id)
    .maybeSingle();

  if (sourceError) return safeActionError("SOURCE_TOOL_LOOKUP_FAILED");
  if (!sourceTool) return safeActionError("SOURCE_TOOL_NOT_FOUND");

  if (payload.related_tool_ids.length) {
    const { data: relatedTools, error: relatedToolsError } = await supabase
      .from("tools")
      .select("id")
      .in("id", payload.related_tool_ids);

    if (relatedToolsError) return safeActionError("RELATED_TOOL_LOOKUP_FAILED");

    const foundIds = new Set((relatedTools ?? []).map((item) => item.id));
    if (payload.related_tool_ids.some((id) => !foundIds.has(id))) {
      return safeActionError("RELATED_TOOL_NOT_FOUND");
    }
  }

  const { error: clearError } = await supabase
    .from("tool_related_tools")
    .delete()
    .eq("tool_id", payload.tool_id);

  if (clearError) return safeActionError("TOOL_RELATED_CLEAR_FAILED");

  if (payload.related_tool_ids.length) {
    const rows = payload.related_tool_ids.map((relatedToolId, index) => ({
      tool_id: payload.tool_id,
      related_tool_id: relatedToolId,
      sort_order: (index + 1) * 10,
    }));

    const { error: insertError } = await supabase
      .from("tool_related_tools")
      .insert(rows);

    if (insertError) return safeActionError("TOOL_RELATED_INSERT_FAILED");
  }

  await revalidateToolPaths(supabase, payload.tool_id);
  revalidatePath("/admin/tools/related");
  return { ok: true };
}
