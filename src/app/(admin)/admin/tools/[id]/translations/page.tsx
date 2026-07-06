import { notFound } from "next/navigation";

import {
  upsertToolFieldTranslationAction,
  upsertToolTranslationAction,
} from "@/actions/admin";
import type { ToolInputSchema } from "@/domain/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function ToolTranslationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createSupabaseAdminClient();
  const [
    { data: tool },
    { data: locales },
    { data: translations },
    { data: fieldTranslations },
  ] = await Promise.all([
    supabase.from("tools").select("id, slug, title_ar, title_en, short_description, prompt_template, input_schema").eq("id", id).maybeSingle(),
    supabase.from("locales").select("id, code, native_name").eq("is_active", true).order("sort_order"),
    supabase.from("tool_translations").select("*").eq("tool_id", id),
    supabase.from("tool_field_translations").select("*").eq("tool_id", id),
  ]);

  if (!tool) notFound();
  const schema = tool.input_schema as unknown as ToolInputSchema;
  const translatableFields = [
    { key: "__submit__", label: schema.submitLabel, placeholder: "", helpText: "", options: undefined },
    ...schema.fields,
  ];

  return (
    <>
      <div className="admin-head">
        <div className="eyebrow">TOOL TRANSLATIONS</div>
        <h1>{tool.title_ar}</h1>
        <p>{tool.slug} — ترجمة المحتوى والحقول وخيارات Select بدون تغيير مفاتيح الحقول.</p>
      </div>

      <div className="identity-grid">
        {locales?.map((locale) => {
          const translation = translations?.find((item) => item.locale_id === locale.id);
          return (
            <form action={upsertToolTranslationAction} className="panel admin-form" key={locale.id}>
              <input type="hidden" name="tool_id" value={tool.id} />
              <input type="hidden" name="locale_id" value={locale.id} />
              <h3>{locale.native_name} <span className="badge">{locale.code}</span></h3>
              <label>العنوان<input name="title" defaultValue={translation?.title ?? (locale.code === "ar" ? tool.title_ar : tool.title_en)} required /></label>
              <label>الوصف<textarea name="short_description" defaultValue={translation?.short_description ?? tool.short_description} required /></label>
              <label>SEO Title<input name="seo_title" defaultValue={translation?.seo_title ?? ""} /></label>
              <label>SEO Description<textarea name="seo_description" defaultValue={translation?.seo_description ?? ""} /></label>
              <label>Prompt Override<textarea name="prompt_template_override" defaultValue={translation?.prompt_template_override ?? ""} /></label>
              <button className="button button-dark">حفظ ترجمة الأداة</button>
            </form>
          );
        })}
      </div>

      <div className="admin-head admin-section-gap">
        <div className="eyebrow">FIELD TRANSLATIONS</div>
        <h2>ترجمة واجهة الإدخال</h2>
        <p>القيم التقنية مثل `topic` و`professional` تبقى ثابتة؛ فقط النص المعروض يترجم.</p>
      </div>

      {locales?.map((locale) => (
        <section className="panel admin-section-gap" key={locale.id}>
          <h2>{locale.native_name} <span className="badge">{locale.code}</span></h2>
          <div className="field-translation-grid">
            {translatableFields.map((field) => {
              const current = fieldTranslations?.find((item) => item.locale_id === locale.id && item.field_key === field.key);
              return (
                <form action={upsertToolFieldTranslationAction} className="admin-form field-translation-card" key={field.key}>
                  <input type="hidden" name="tool_id" value={tool.id} />
                  <input type="hidden" name="locale_id" value={locale.id} />
                  <input type="hidden" name="field_key" value={field.key} />
                  <strong>{field.key}</strong>
                  <label>Label<input name="label" defaultValue={current?.label ?? field.label} required /></label>
                  {field.key !== "__submit__" ? <>
                    <label>Placeholder<input name="placeholder" defaultValue={current?.placeholder ?? field.placeholder ?? ""} /></label>
                    <label>Help Text<input name="help_text" defaultValue={current?.help_text ?? field.helpText ?? ""} /></label>
                    <label>Options JSON<textarea name="options" defaultValue={current?.options ? JSON.stringify(current.options, null, 2) : field.options ? JSON.stringify(field.options, null, 2) : ""} /></label>
                  </> : null}
                  <button className="button button-dark">حفظ الحقل</button>
                </form>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}
