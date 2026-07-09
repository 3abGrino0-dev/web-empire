import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { calculateToolContentCompleteness } from "@/domain/tool-content";

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export default async function AdminToolsPage() {
  const supabase = createSupabaseAdminClient();
  const [{ data: tools }, { data: locales }] = await Promise.all([
    supabase
      .from("tools")
      .select(
        "id, slug, title_ar, title_en, engine_type, pricing_mode, is_active, is_featured, requires_auth, seo_title, seo_description, categories(name_ar)"
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("locales")
      .select("id, code, fallback_locale_id, is_default")
      .eq("is_active", true)
      .order("sort_order"),
  ]);

  const preferredLocale =
    (locales ?? []).find((locale) => locale.code === "ar") ??
    (locales ?? []).find((locale) => locale.is_default) ??
    (locales ?? [])[0];

  const localeIds = preferredLocale
    ? [preferredLocale.id, ...(preferredLocale.fallback_locale_id ? [preferredLocale.fallback_locale_id] : [])]
    : [];

  const toolIds = (tools ?? []).map((tool) => tool.id);
  const [{ data: translations }, { data: contents }] = await Promise.all([
    toolIds.length && localeIds.length
      ? supabase
          .from("tool_translations")
          .select("tool_id, locale_id, seo_title, seo_description")
          .in("tool_id", toolIds)
          .in("locale_id", localeIds)
      : Promise.resolve({ data: [], error: null }),
    toolIds.length && localeIds.length
      ? supabase
          .from("tool_content_translations")
          .select("tool_id, locale_id, what_is, use_cases, how_to_steps, methodology, example_content, faq")
          .in("tool_id", toolIds)
          .in("locale_id", localeIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const translationMap = new Map<string, { seo_title: string | null; seo_description: string | null }>();
  for (const localeId of localeIds) {
    for (const row of translations ?? []) {
      if (row.locale_id === localeId && !translationMap.has(row.tool_id)) {
        translationMap.set(row.tool_id, {
          seo_title: row.seo_title,
          seo_description: row.seo_description,
        });
      }
    }
  }

  const contentMap = new Map<string, {
    what_is: string;
    use_cases: unknown;
    how_to_steps: unknown;
    methodology: string;
    example_content: string;
    faq: unknown;
  }>();
  for (const localeId of localeIds) {
    for (const row of contents ?? []) {
      if (row.locale_id === localeId && !contentMap.has(row.tool_id)) {
        contentMap.set(row.tool_id, {
          what_is: row.what_is,
          use_cases: row.use_cases,
          how_to_steps: row.how_to_steps,
          methodology: row.methodology,
          example_content: row.example_content,
          faq: row.faq,
        });
      }
    }
  }

  return (
    <>
      <div className="admin-head">
        <div className="eyebrow">TOOL CONTENT + GOVERNANCE</div>
        <h1>جميع الأدوات</h1>
        <p>قائمة تشغيلية لإدارة حالة الأداة والمحتوى والاستعداد لـ SEO و AI Assist.</p>
        <Link
          href="/admin/tools/new"
          className="button button-primary"
        >
          + أداة جديدة
        </Link>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>الأداة</th>
              <th>Slug</th>
              <th>التصنيف</th>
              <th>المحرك</th>
              <th>الحالة</th>
              <th>Featured</th>
              <th>يتطلب تسجيل</th>
              <th>Pricing</th>
              <th>AI Assist</th>
              <th>CONTENT / SEO</th>
              <th>محرر المحتوى</th>
              <th>الترجمات</th>
            </tr>
          </thead>
          <tbody>
            {(tools ?? []).map((tool) => (
              (() => {
                const translation = translationMap.get(tool.id);
                const content = contentMap.get(tool.id);
                const completeness = calculateToolContentCompleteness({
                  seoTitle: translation?.seo_title ?? tool.seo_title,
                  seoDescription: translation?.seo_description ?? tool.seo_description,
                  whatIs: content?.what_is,
                  useCases: asArray(content?.use_cases) as never,
                  howToSteps: asArray(content?.how_to_steps) as never,
                  methodology: content?.methodology,
                  exampleContent: content?.example_content,
                  faq: asArray(content?.faq) as never,
                });

                return (
                  <tr key={tool.id}>
                    <td>{tool.title_ar || tool.title_en}</td>
                    <td>{tool.slug}</td>
                    <td>{Array.isArray(tool.categories) ? tool.categories[0]?.name_ar ?? "-" : "-"}</td>
                    <td>{tool.engine_type}</td>
                    <td>
                      <span className={`status-pill ${tool.is_active ? "ok" : "warn"}`}>
                        {tool.is_active ? "نشطة" : "متوقفة"}
                      </span>
                    </td>
                    <td className="flag-cell">{tool.is_featured ? "نعم" : "لا"}</td>
                    <td className="flag-cell">{tool.requires_auth ? "نعم" : "لا"}</td>
                    <td>{tool.pricing_mode}</td>
                    <td>
                      <span className="status-pill warn">قريبًا</span>
                    </td>
                    <td>
                      <span className={`status-pill ${completeness.percentage === 100 ? "ok" : completeness.percentage > 0 ? "warn" : "error"}`}>
                        {completeness.percentage === 0 ? "Missing" : `${completeness.percentage}%`}
                      </span>
                    </td>
                    <td>
                      <Link className="badge" href={`/admin/tools/${tool.id}/content`}>
                        المحتوى و SEO
                      </Link>
                    </td>
                    <td>
                      <Link className="badge" href={`/admin/tools/${tool.id}/translations`}>
                        إدارة اللغات
                      </Link>
                    </td>
                  </tr>
                );
              })()
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
