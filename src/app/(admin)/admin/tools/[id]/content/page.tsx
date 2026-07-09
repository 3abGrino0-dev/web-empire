import { notFound } from "next/navigation";

import { ToolContentEditor } from "@/components/admin/tool-content-editor";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function AdminToolContentEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createSupabaseAdminClient();

  const [
    { data: tool },
    { data: locales },
    { data: toolTranslations },
    { data: toolContents },
    { data: relatedTools },
    { data: candidateTools },
  ] = await Promise.all([
    supabase
      .from("tools")
      .select("id, slug, title_ar, title_en, engine_type, is_active")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("locales")
      .select("id, code, locale_code, name, native_name, direction, fallback_locale_id, is_default, is_active, sort_order")
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("tool_translations")
      .select("locale_id, seo_title, seo_description")
      .eq("tool_id", id),
    supabase
      .from("tool_content_translations")
      .select("locale_id, primary_keyword, secondary_keywords, what_is, use_cases, how_to_steps, methodology, example_title, example_content, faq")
      .eq("tool_id", id),
    supabase
      .from("tool_related_tools")
      .select("related_tool_id")
      .eq("tool_id", id)
      .order("sort_order"),
    supabase
      .from("tools")
      .select("id, slug, title_ar, title_en, engine_type, is_active")
      .neq("id", id)
      .order("title_ar"),
  ]);

  if (!tool) notFound();

  return (
    <ToolContentEditor
      tool={tool}
      locales={locales ?? []}
      toolTranslations={toolTranslations ?? []}
      toolContents={toolContents ?? []}
      relatedTools={relatedTools ?? []}
      candidateTools={candidateTools ?? []}
    />
  );
}
