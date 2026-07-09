import "server-only";

import type {
  ToolContent,
  ToolContentCompleteness,
  ToolFaqItem,
  ToolHowToStep,
  ToolUseCase,
} from "@/domain/tool-content";
import { calculateToolContentCompleteness } from "@/domain/tool-content";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  toolFaqArraySchema,
  toolHowToStepArraySchema,
  toolUseCaseArraySchema,
} from "@/lib/tool-content-validation";
import { getLocaleByCode } from "@/localization/repository";

interface ToolRow {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string;
  short_description: string;
  engine_type: string;
  seo_title: string | null;
  seo_description: string | null;
  is_active: boolean;
}

interface ToolTranslationRow {
  tool_id: string;
  locale_id: string;
  title: string;
  short_description: string;
  seo_title: string | null;
  seo_description: string | null;
}

interface ToolContentRow {
  tool_id: string;
  locale_id: string;
  primary_keyword: string | null;
  secondary_keywords: string[];
  what_is: string;
  use_cases: unknown;
  how_to_steps: unknown;
  methodology: string;
  example_title: string;
  example_content: string;
  faq: unknown;
}

export interface ToolContentBySlugResult {
  toolId: string;
  slug: string;
  localeCode: string;
  title: string;
  shortDescription: string;
  engineType: string;
  seoTitle: string;
  seoDescription: string;
  content: ToolContent;
}

export interface RelatedToolItem {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  engineType: string;
  sortOrder: number;
}

function parseUseCases(value: unknown): ToolUseCase[] {
  const parsed = toolUseCaseArraySchema.safeParse(value);
  return parsed.success ? parsed.data : [];
}

function parseHowToSteps(value: unknown): ToolHowToStep[] {
  const parsed = toolHowToStepArraySchema.safeParse(value);
  return parsed.success ? parsed.data : [];
}

function parseFaq(value: unknown): ToolFaqItem[] {
  const parsed = toolFaqArraySchema.safeParse(value);
  return parsed.success ? parsed.data : [];
}

function pickPreferredLocaleRow<T extends { locale_id: string }>(
  rows: T[] | null,
  localeIds: string[],
): T | null {
  const list = rows ?? [];
  for (const localeId of localeIds) {
    const row = list.find((item) => item.locale_id === localeId);
    if (row) return row;
  }
  return null;
}

function mapContent(
  toolId: string,
  localeId: string,
  row: ToolContentRow | null,
  seoTitle: string,
  seoDescription: string,
): ToolContent {
  return {
    toolId,
    localeId,
    seoTitle,
    seoDescription,
    primaryKeyword: row?.primary_keyword?.trim() ?? "",
    secondaryKeywords: Array.isArray(row?.secondary_keywords)
      ? row.secondary_keywords
      : [],
    whatIs: row?.what_is ?? "",
    useCases: parseUseCases(row?.use_cases),
    howToSteps: parseHowToSteps(row?.how_to_steps),
    methodology: row?.methodology ?? "",
    exampleTitle: row?.example_title ?? "",
    exampleContent: row?.example_content ?? "",
    faq: parseFaq(row?.faq),
  };
}

async function getToolAndLocaleContext(toolId: string, localeCode: string) {
  const locale = await getLocaleByCode(localeCode);
  if (!locale) return null;

  const supabase = await createSupabaseServerClient();
  const { data: tool, error: toolError } = await supabase
    .from("tools")
    .select("id, slug, title_ar, title_en, short_description, engine_type, seo_title, seo_description, is_active")
    .eq("id", toolId)
    .maybeSingle();

  if (toolError) throw new Error(toolError.message);
  if (!tool) return null;

  return {
    locale,
    tool: tool as ToolRow,
  };
}

export async function getToolContentByLocale(
  toolId: string,
  localeCode: string,
): Promise<ToolContent | null> {
  const context = await getToolAndLocaleContext(toolId, localeCode);
  if (!context) return null;

  const { locale, tool } = context;
  const localeIds = [locale.id];
  if (locale.fallback_locale_id) localeIds.push(locale.fallback_locale_id);

  const supabase = await createSupabaseServerClient();
  const [{ data: translations, error: translationError }, { data: contentRows, error: contentError }] =
    await Promise.all([
      supabase
        .from("tool_translations")
        .select("tool_id, locale_id, title, short_description, seo_title, seo_description")
        .eq("tool_id", toolId)
        .in("locale_id", localeIds),
      supabase
        .from("tool_content_translations")
        .select("tool_id, locale_id, primary_keyword, secondary_keywords, what_is, use_cases, how_to_steps, methodology, example_title, example_content, faq")
        .eq("tool_id", toolId)
        .in("locale_id", localeIds),
    ]);

  if (translationError) throw new Error(translationError.message);
  if (contentError) throw new Error(contentError.message);

  const translation = pickPreferredLocaleRow(
    (translations ?? []) as ToolTranslationRow[],
    localeIds,
  );
  const content = pickPreferredLocaleRow(
    (contentRows ?? []) as ToolContentRow[],
    localeIds,
  );

  const fallbackTitle = locale.code === "ar" ? tool.title_ar : tool.title_en;
  const fallbackDescription = tool.short_description;
  const seoTitle = translation?.seo_title ?? tool.seo_title ?? translation?.title ?? fallbackTitle;
  const seoDescription =
    translation?.seo_description ?? tool.seo_description ?? translation?.short_description ?? fallbackDescription;

  return mapContent(tool.id, locale.id, content, seoTitle, seoDescription);
}

export async function getToolContentBySlug(
  slug: string,
  localeCode: string,
): Promise<ToolContentBySlugResult | null> {
  const locale = await getLocaleByCode(localeCode);
  if (!locale) return null;

  const supabase = await createSupabaseServerClient();
  const { data: tool, error: toolError } = await supabase
    .from("tools")
    .select("id, slug, title_ar, title_en, short_description, engine_type, seo_title, seo_description, is_active")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (toolError) throw new Error(toolError.message);
  if (!tool) return null;

  const localeIds = [locale.id];
  if (locale.fallback_locale_id) localeIds.push(locale.fallback_locale_id);

  const [{ data: translations, error: translationError }, { data: contentRows, error: contentError }] =
    await Promise.all([
      supabase
        .from("tool_translations")
        .select("tool_id, locale_id, title, short_description, seo_title, seo_description")
        .eq("tool_id", tool.id)
        .in("locale_id", localeIds),
      supabase
        .from("tool_content_translations")
        .select("tool_id, locale_id, primary_keyword, secondary_keywords, what_is, use_cases, how_to_steps, methodology, example_title, example_content, faq")
        .eq("tool_id", tool.id)
        .in("locale_id", localeIds),
    ]);

  if (translationError) throw new Error(translationError.message);
  if (contentError) throw new Error(contentError.message);

  const translation = pickPreferredLocaleRow(
    (translations ?? []) as ToolTranslationRow[],
    localeIds,
  );
  const content = pickPreferredLocaleRow(
    (contentRows ?? []) as ToolContentRow[],
    localeIds,
  );

  const toolRow = tool as ToolRow;
  const fallbackTitle = locale.code === "ar" ? toolRow.title_ar : toolRow.title_en;
  const localizedTitle = translation?.title ?? fallbackTitle;
  const localizedDescription = translation?.short_description ?? toolRow.short_description;
  const seoTitle = translation?.seo_title ?? toolRow.seo_title ?? localizedTitle;
  const seoDescription =
    translation?.seo_description ?? toolRow.seo_description ?? localizedDescription;

  return {
    toolId: toolRow.id,
    slug: toolRow.slug,
    localeCode: locale.code,
    title: localizedTitle,
    shortDescription: localizedDescription,
    engineType: toolRow.engine_type,
    seoTitle,
    seoDescription,
    content: mapContent(toolRow.id, locale.id, content, seoTitle, seoDescription),
  };
}

export async function getRelatedTools(
  toolId: string,
  localeCode: string,
): Promise<RelatedToolItem[]> {
  const locale = await getLocaleByCode(localeCode);
  if (!locale) return [];

  const supabase = await createSupabaseServerClient();
  const { data: relations, error: relationError } = await supabase
    .from("tool_related_tools")
    .select("tool_id, related_tool_id, sort_order")
    .eq("tool_id", toolId)
    .order("sort_order", { ascending: true });

  if (relationError) throw new Error(relationError.message);
  if (!relations?.length) return [];

  const relatedToolIds = relations.map((item) => item.related_tool_id);
  const localeIds = [locale.id];
  if (locale.fallback_locale_id) localeIds.push(locale.fallback_locale_id);

  const [{ data: tools, error: toolsError }, { data: translations, error: translationsError }] =
    await Promise.all([
      supabase
        .from("tools")
        .select("id, slug, title_ar, title_en, short_description, engine_type, is_active")
        .in("id", relatedToolIds)
        .eq("is_active", true),
      supabase
        .from("tool_translations")
        .select("tool_id, locale_id, title, short_description")
        .in("tool_id", relatedToolIds)
        .in("locale_id", localeIds),
    ]);

  if (toolsError) throw new Error(toolsError.message);
  if (translationsError) throw new Error(translationsError.message);

  const toolMap = new Map((tools ?? []).map((item) => [item.id, item as ToolRow]));

  return relations
    .map((relation) => {
      const row = toolMap.get(relation.related_tool_id);
      if (!row) return null;

      const localized = pickPreferredLocaleRow(
        (translations ?? []).filter((item) => item.tool_id === row.id) as ToolTranslationRow[],
        localeIds,
      );

      return {
        id: row.id,
        slug: row.slug,
        title: localized?.title ?? (locale.code === "ar" ? row.title_ar : row.title_en),
        shortDescription: localized?.short_description ?? row.short_description,
        engineType: row.engine_type,
        sortOrder: relation.sort_order,
      };
    })
    .filter((item): item is RelatedToolItem => item !== null);
}

export async function getToolContentCompleteness(
  toolId: string,
  localeCode: string,
): Promise<ToolContentCompleteness> {
  const content = await getToolContentByLocale(toolId, localeCode);

  if (!content) {
    return {
      percentage: 0,
      completedCount: 0,
      totalCount: 8,
      missingFieldKeys: [
        "seo_title",
        "seo_description",
        "what_is",
        "use_cases",
        "how_to_steps",
        "methodology",
        "example_content",
        "faq",
      ],
    };
  }

  return calculateToolContentCompleteness({
    seoTitle: content.seoTitle,
    seoDescription: content.seoDescription,
    whatIs: content.whatIs,
    useCases: content.useCases,
    howToSteps: content.howToSteps,
    methodology: content.methodology,
    exampleContent: content.exampleContent,
    faq: content.faq,
  });
}
