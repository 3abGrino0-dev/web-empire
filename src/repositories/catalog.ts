import "server-only";

import type {
  LocalizedToolRecord,
  ToolFieldOption,
  ToolInputField,
  ToolInputSchema,
  ToolRecord,
} from "@/domain/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getLocaleByCode } from "@/localization/repository";

interface ToolTranslationRow {
  tool_id: string;
  title: string;
  short_description: string;
  seo_title: string | null;
  seo_description: string | null;
  prompt_template_override: string | null;
}

interface FieldTranslationRow {
  tool_id: string;
  field_key: string;
  label: string;
  placeholder: string | null;
  help_text: string | null;
  options: unknown;
}

function localizedSchema(
  schema: ToolInputSchema,
  rows: FieldTranslationRow[],
): ToolInputSchema {
  const byKey = new Map(rows.map((row) => [row.field_key, row]));
  const submitTranslation = byKey.get("__submit__");

  return {
    ...schema,
    submitLabel: submitTranslation?.label || schema.submitLabel,
    fields: schema.fields.map((field): ToolInputField => {
      const translation = byKey.get(field.key);
      if (!translation) return field;

      const options = Array.isArray(translation.options)
        ? (translation.options as ToolFieldOption[])
        : field.options;

      return {
        ...field,
        label: translation.label || field.label,
        placeholder: translation.placeholder ?? field.placeholder,
        helpText: translation.help_text ?? field.helpText,
        options,
      };
    }),
  };
}

async function localizeTools(tools: ToolRecord[], localeCode: string): Promise<LocalizedToolRecord[]> {
  if (!tools.length) return [];

  const locale = await getLocaleByCode(localeCode);
  if (!locale) return [];

  const supabase = await createSupabaseServerClient();
  const toolIds = tools.map((tool) => tool.id);
  const localeIds = [locale.id];
  if (locale.fallback_locale_id) localeIds.unshift(locale.fallback_locale_id);

  const [{ data: translations, error: translationError }, { data: fields, error: fieldError }] =
    await Promise.all([
      supabase
        .from("tool_translations")
        .select("tool_id, title, short_description, seo_title, seo_description, prompt_template_override, locale_id")
        .in("tool_id", toolIds)
        .in("locale_id", localeIds),
      supabase
        .from("tool_field_translations")
        .select("tool_id, field_key, label, placeholder, help_text, options, locale_id")
        .in("tool_id", toolIds)
        .in("locale_id", localeIds),
    ]);

  if (translationError) throw new Error(translationError.message);
  if (fieldError) throw new Error(fieldError.message);

  const translationMap = new Map<string, ToolTranslationRow>();
  const fieldMap = new Map<string, FieldTranslationRow[]>();

  for (const localeId of localeIds) {
    for (const row of translations ?? []) {
      if (row.locale_id === localeId) translationMap.set(row.tool_id, row as ToolTranslationRow);
    }
    for (const row of fields ?? []) {
      if (row.locale_id !== localeId) continue;
      const current = fieldMap.get(row.tool_id) ?? [];
      const index = current.findIndex((field) => field.field_key === row.field_key);
      if (index >= 0) current[index] = row as FieldTranslationRow;
      else current.push(row as FieldTranslationRow);
      fieldMap.set(row.tool_id, current);
    }
  }

  return tools.map((tool) => {
    const translation = translationMap.get(tool.id);
    const title = translation?.title ?? (localeCode === "ar" ? tool.title_ar : tool.title_en);
    const description = translation?.short_description ?? tool.short_description;

    return {
      ...tool,
      locale: localeCode,
      title,
      localizedDescription: description,
      localizedInputSchema: localizedSchema(tool.input_schema, fieldMap.get(tool.id) ?? []),
      localizedPromptTemplate: translation?.prompt_template_override ?? tool.prompt_template,
      seoTitle: translation?.seo_title ?? title,
      seoDescription: translation?.seo_description ?? description,
    };
  });
}

export async function getActiveCategories(localeCode: string) {
  const locale = await getLocaleByCode(localeCode);
  if (!locale) return [];

  const supabase = await createSupabaseServerClient();
  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, slug, icon, style_key, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw new Error(error.message);
  if (!categories?.length) return [];

  const localeIds = [locale.id];
  if (locale.fallback_locale_id) localeIds.unshift(locale.fallback_locale_id);

  const { data: translations, error: translationError } = await supabase
    .from("category_translations")
    .select("category_id, locale_id, name, description")
    .in("category_id", categories.map((category) => category.id))
    .in("locale_id", localeIds);

  if (translationError) throw new Error(translationError.message);

  const map = new Map<string, { name: string; description: string }>();
  for (const localeId of localeIds) {
    for (const row of translations ?? []) {
      if (row.locale_id === localeId) map.set(row.category_id, row);
    }
  }

  return categories.map((category) => ({
    ...category,
    name: map.get(category.id)?.name ?? category.slug,
    description: map.get(category.id)?.description ?? "",
  }));
}

export async function getActiveTools(localeCode: string): Promise<LocalizedToolRecord[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tools")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw new Error(error.message);
  return localizeTools((data ?? []) as ToolRecord[], localeCode);
}

export async function getToolBySlug(
  slug: string,
  localeCode: string,
): Promise<LocalizedToolRecord | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tools")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const [tool] = await localizeTools([data as ToolRecord], localeCode);
  return tool ?? null;
}

export async function getToolRuntimeBySlug(slug: string): Promise<ToolRecord | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tools")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as ToolRecord | null;
}

export async function getActivePlans(localeCode: string) {
  const locale = await getLocaleByCode(localeCode);
  if (!locale) return [];

  const supabase = await createSupabaseServerClient();
  const { data: plans, error } = await supabase
    .from("plans")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw new Error(error.message);
  if (!plans?.length) return [];

  const localeIds = [locale.id];
  if (locale.fallback_locale_id) localeIds.unshift(locale.fallback_locale_id);

  const { data: translations, error: translationError } = await supabase
    .from("plan_translations")
    .select("plan_id, locale_id, name, description")
    .in("plan_id", plans.map((plan) => plan.id))
    .in("locale_id", localeIds);

  if (translationError) throw new Error(translationError.message);

  const map = new Map<string, { name: string; description: string }>();
  for (const localeId of localeIds) {
    for (const row of translations ?? []) {
      if (row.locale_id === localeId) map.set(row.plan_id, row);
    }
  }

  return plans.map((plan) => ({
    ...plan,
    localizedName: map.get(plan.id)?.name ?? plan.name_en,
    localizedDescription: map.get(plan.id)?.description ?? plan.description,
  }));
}
