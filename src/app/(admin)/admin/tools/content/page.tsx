import Link from "next/link";

import { calculateToolContentCompleteness } from "@/domain/tool-content";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

interface TranslationRow {
  tool_id: string;
  locale_id: string;
  seo_title: string | null;
  seo_description: string | null;
}

interface ContentRow {
  tool_id: string;
  locale_id: string;
  what_is: string;
  use_cases: unknown;
  how_to_steps: unknown;
  methodology: string;
  example_content: string;
  faq: unknown;
}

interface LocaleRow {
  id: string;
  code: string;
  native_name: string;
  is_default: boolean;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export default async function AdminToolContentIndexPage() {
  const supabase = createSupabaseAdminClient();

  const [{ data: tools }, { data: locales }, { data: relatedRows }] = await Promise.all([
    supabase
      .from("tools")
      .select("id, title_ar, title_en, slug, engine_type, is_active")
      .order("title_ar"),
    supabase
      .from("locales")
      .select("id, code, native_name, is_default")
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("tool_related_tools")
      .select("tool_id, related_tool_id"),
  ]);

  const localeIds = (locales ?? []).map((locale) => locale.id);

  const [{ data: translations }, { data: contents }] = await Promise.all([
    localeIds.length
      ? supabase
          .from("tool_translations")
          .select("tool_id, locale_id, seo_title, seo_description")
          .in("locale_id", localeIds)
      : Promise.resolve({ data: [], error: null }),
    localeIds.length
      ? supabase
          .from("tool_content_translations")
          .select("tool_id, locale_id, what_is, use_cases, how_to_steps, methodology, example_content, faq")
          .in("locale_id", localeIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const translationMap = new Map<string, TranslationRow>();
  for (const row of (translations ?? []) as TranslationRow[]) {
    translationMap.set(`${row.tool_id}:${row.locale_id}`, row);
  }

  const contentMap = new Map<string, ContentRow>();
  for (const row of (contents ?? []) as ContentRow[]) {
    contentMap.set(`${row.tool_id}:${row.locale_id}`, row);
  }

  const relatedCountMap = new Map<string, number>();
  for (const row of relatedRows ?? []) {
    relatedCountMap.set(row.tool_id, (relatedCountMap.get(row.tool_id) ?? 0) + 1);
  }

  const arLocale = (locales ?? []).find((locale) => locale.code === "ar") as LocaleRow | undefined;
  const enLocale = (locales ?? []).find((locale) => locale.code === "en") as LocaleRow | undefined;
  const otherLocales = (locales ?? []).filter((locale) => !["ar", "en"].includes(locale.code)) as LocaleRow[];

  function completenessFor(toolId: string, localeId: string) {
    const translation = translationMap.get(`${toolId}:${localeId}`);
    const content = contentMap.get(`${toolId}:${localeId}`);

    return calculateToolContentCompleteness({
      seoTitle: translation?.seo_title,
      seoDescription: translation?.seo_description,
      whatIs: content?.what_is,
      useCases: asArray(content?.use_cases) as never,
      howToSteps: asArray(content?.how_to_steps) as never,
      methodology: content?.methodology,
      exampleContent: content?.example_content,
      faq: asArray(content?.faq) as never,
    });
  }

  return (
    <>
      <div className="admin-head">
        <div className="eyebrow">TOOL CONTENT INDEX</div>
        <h1>محتوى الأدوات و SEO</h1>
        <p>إدارة شاملة لمحتوى كل أداة عبر اللغات النشطة.</p>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Tool</th>
              <th>Slug</th>
              <th>Engine</th>
              <th>Active</th>
              <th>Arabic Content %</th>
              <th>English Content %</th>
              <th>Other Active Locales Status</th>
              <th>Related Tools Count</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {(tools ?? []).map((tool) => {
              const arCompleteness = arLocale ? completenessFor(tool.id, arLocale.id) : null;
              const enCompleteness = enLocale ? completenessFor(tool.id, enLocale.id) : null;

              return (
                <tr key={tool.id}>
                  <td>{tool.title_ar || tool.title_en}</td>
                  <td>{tool.slug}</td>
                  <td>{tool.engine_type}</td>
                  <td>
                    <span className={`status-pill ${tool.is_active ? "ok" : "warn"}`}>
                      {tool.is_active ? "نشطة" : "غير نشطة"}
                    </span>
                  </td>
                  <td>{arCompleteness ? `${arCompleteness.percentage}%` : "Missing"}</td>
                  <td>{enCompleteness ? `${enCompleteness.percentage}%` : "Missing"}</td>
                  <td>
                    <div className="chip-row">
                      {otherLocales.length
                        ? otherLocales.map((locale) => {
                            const completeness = completenessFor(tool.id, locale.id);
                            return (
                              <span className="chip" key={`${tool.id}-${locale.id}`}>
                                {locale.code}: {completeness.percentage}%
                              </span>
                            );
                          })
                        : <span className="inline-note">لا توجد لغات إضافية نشطة</span>}
                    </div>
                  </td>
                  <td>{relatedCountMap.get(tool.id) ?? 0}</td>
                  <td>
                    <Link className="badge" href={`/admin/tools/${tool.id}/content`}>
                      إدارة المحتوى
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
