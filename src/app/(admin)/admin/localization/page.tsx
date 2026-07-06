import {
  addCountryGroupMemberAction,
  createCountryGroupAction,
  createLocaleAction,
  upsertCategoryTranslationAction,
  upsertCountryLocaleRuleAction,
  upsertPlanTranslationAction,
  upsertUiTranslationAction,
} from "@/actions/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function LocalizationAdminPage() {
  const supabase = createSupabaseAdminClient();
  const [
    { data: locales },
    { data: rules },
    { data: translationRows },
    { data: categories },
    { data: plans },
    { data: categoryTranslations },
    { data: planTranslations },
    { data: groups },
    { data: groupMembers },
  ] = await Promise.all([
    supabase.from("locales").select("*").order("sort_order"),
    supabase
      .from("country_locale_rules")
      .select("country_code, country_name, locale_id, fallback_locale_id, is_active, locales!country_locale_rules_locale_id_fkey(native_name, code)")
      .order("country_code"),
    supabase
      .from("ui_translations")
      .select("locale_id, translation_key, translation_value, locales(code, native_name)")
      .order("translation_key")
      .limit(200),
    supabase.from("categories").select("id, slug, name_ar, name_en").order("sort_order"),
    supabase.from("plans").select("id, slug, name_ar, name_en").order("sort_order"),
    supabase.from("category_translations").select("category_id, locale_id, name, description").limit(200),
    supabase.from("plan_translations").select("plan_id, locale_id, name, description").limit(200),
    supabase.from("country_groups").select("id, slug, name, locale_id, priority, is_active, locales!country_groups_locale_id_fkey(native_name, code)").order("priority"),
    supabase.from("country_group_members").select("group_id, country_code").order("country_code"),
  ]);

  return (
    <>
      <div className="admin-head">
        <div className="eyebrow">SMART LOCALIZATION</div>
        <h1>اللغات والدول</h1>
        <p>اختيار المستخدم أولًا، ثم الدولة، ثم لغة المتصفح، ثم اللغة الافتراضية.</p>
      </div>

      <div className="admin-two-column">
        <section className="panel">
          <h2>إضافة لغة</h2>
          <form action={createLocaleAction} className="admin-form">
            <div className="form-grid">
              <label>Code<input name="code" placeholder="de" required /></label>
              <label>Locale<input name="locale_code" placeholder="de-DE" required /></label>
              <label>الاسم الإنجليزي<input name="name" placeholder="German" required /></label>
              <label>الاسم الأصلي<input name="native_name" placeholder="Deutsch" required /></label>
              <label>الاتجاه<select name="direction"><option value="ltr">LTR</option><option value="rtl">RTL</option></select></label>
              <label>Fallback<select name="fallback_locale_id" defaultValue=""><option value="">بدون</option>{locales?.map((locale) => <option key={locale.id} value={locale.id}>{locale.native_name}</option>)}</select></label>
              <label>الترتيب<input name="sort_order" type="number" defaultValue="100" /></label>
              <label className="check-row"><input name="is_active" type="checkbox" defaultChecked /> نشطة</label>
              <label className="check-row"><input name="is_default" type="checkbox" /> افتراضية</label>
            </div>
            <button className="button button-primary">إضافة اللغة</button>
          </form>
        </section>

        <section className="panel">
          <h2>ربط دولة بلغة</h2>
          <form action={upsertCountryLocaleRuleAction} className="admin-form">
            <div className="form-grid">
              <label>Country Code<input name="country_code" placeholder="DE" required maxLength={2} /></label>
              <label>الدولة<input name="country_name" placeholder="Germany" required /></label>
              <label>اللغة<select name="locale_id" required>{locales?.map((locale) => <option key={locale.id} value={locale.id}>{locale.native_name}</option>)}</select></label>
              <label>Fallback<select name="fallback_locale_id" defaultValue=""><option value="">بدون</option>{locales?.map((locale) => <option key={locale.id} value={locale.id}>{locale.native_name}</option>)}</select></label>
              <label className="check-row"><input name="is_active" type="checkbox" defaultChecked /> نشط</label>
            </div>
            <button className="button button-dark">حفظ قاعدة الدولة</button>
          </form>
        </section>
      </div>

      <div className="admin-two-column admin-section-gap">
        <section className="panel">
          <h2>مجموعة دول</h2>
          <form action={createCountryGroupAction} className="admin-form">
            <label>Slug<input name="slug" placeholder="gcc" required /></label>
            <label>الاسم<input name="name" placeholder="GCC" required /></label>
            <label>اللغة<select name="locale_id" required>{locales?.map((locale) => <option key={locale.id} value={locale.id}>{locale.native_name}</option>)}</select></label>
            <label>Fallback<select name="fallback_locale_id" defaultValue=""><option value="">بدون</option>{locales?.map((locale) => <option key={locale.id} value={locale.id}>{locale.native_name}</option>)}</select></label>
            <label>Priority<input name="priority" type="number" defaultValue="100" /></label>
            <label className="check-row"><input name="is_active" type="checkbox" defaultChecked /> نشطة</label>
            <button className="button button-dark">حفظ المجموعة</button>
          </form>
        </section>
        <section className="panel">
          <h2>إضافة دولة لمجموعة</h2>
          <form action={addCountryGroupMemberAction} className="admin-form">
            <label>المجموعة<select name="group_id" required>{groups?.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}</select></label>
            <label>Country Code<input name="country_code" placeholder="SA" required maxLength={2} /></label>
            <button className="button button-dark">إضافة الدولة</button>
          </form>
          <div className="group-summary">{groups?.map((group) => {
            const locale = Array.isArray(group.locales) ? group.locales[0] : group.locales;
            const members = groupMembers?.filter((member) => member.group_id === group.id).map((member) => member.country_code).join(", ");
            return <p key={group.id}><strong>{group.name}</strong> → {locale?.native_name ?? "-"}: {members || "—"}</p>;
          })}</div>
        </section>
      </div>

      <section className="panel admin-section-gap">
        <h2>إضافة أو تعديل ترجمة واجهة</h2>
        <form action={upsertUiTranslationAction} className="admin-form">
          <div className="form-grid">
            <label>اللغة<select name="locale_id" required>{locales?.map((locale) => <option key={locale.id} value={locale.id}>{locale.native_name}</option>)}</select></label>
            <label>Translation Key<input name="translation_key" placeholder="nav.tools" required /></label>
            <label className="full">النص<textarea name="translation_value" required /></label>
          </div>
          <button className="button button-primary">حفظ الترجمة</button>
        </form>
      </section>

      <div className="admin-two-column admin-section-gap">
        <section className="panel">
          <h2>ترجمة تصنيف</h2>
          <form action={upsertCategoryTranslationAction} className="admin-form">
            <label>التصنيف<select name="category_id" required>{categories?.map((category) => <option key={category.id} value={category.id}>{category.name_ar} / {category.slug}</option>)}</select></label>
            <label>اللغة<select name="locale_id" required>{locales?.map((locale) => <option key={locale.id} value={locale.id}>{locale.native_name}</option>)}</select></label>
            <label>الاسم<input name="name" required /></label>
            <label>الوصف<textarea name="description" /></label>
            <button className="button button-dark">حفظ ترجمة التصنيف</button>
          </form>
          <small>{categoryTranslations?.length ?? 0} ترجمة تصنيف محفوظة</small>
        </section>

        <section className="panel">
          <h2>ترجمة خطة</h2>
          <form action={upsertPlanTranslationAction} className="admin-form">
            <label>الخطة<select name="plan_id" required>{plans?.map((plan) => <option key={plan.id} value={plan.id}>{plan.name_ar} / {plan.slug}</option>)}</select></label>
            <label>اللغة<select name="locale_id" required>{locales?.map((locale) => <option key={locale.id} value={locale.id}>{locale.native_name}</option>)}</select></label>
            <label>الاسم<input name="name" required /></label>
            <label>الوصف<textarea name="description" /></label>
            <button className="button button-dark">حفظ ترجمة الخطة</button>
          </form>
          <small>{planTranslations?.length ?? 0} ترجمة خطة محفوظة</small>
        </section>
      </div>

      <section className="admin-section-gap">
        <div className="section-head"><div><h2>اللغات النشطة</h2></div></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>اللغة</th><th>Code</th><th>Locale</th><th>الاتجاه</th><th>Default</th><th>الحالة</th></tr></thead>
            <tbody>{locales?.map((locale) => <tr key={locale.id}><td>{locale.native_name}</td><td>{locale.code}</td><td>{locale.locale_code}</td><td>{locale.direction}</td><td>{locale.is_default ? "✓" : "-"}</td><td>{locale.is_active ? "نشطة" : "متوقفة"}</td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <section className="admin-section-gap">
        <div className="section-head"><div><h2>قواعد الدول</h2></div></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Code</th><th>الدولة</th><th>اللغة</th><th>الحالة</th></tr></thead>
            <tbody>{rules?.map((rule) => {
              const locale = Array.isArray(rule.locales) ? rule.locales[0] : rule.locales;
              return <tr key={rule.country_code}><td>{rule.country_code}</td><td>{rule.country_name}</td><td>{locale?.native_name ?? "-"} ({locale?.code ?? "-"})</td><td>{rule.is_active ? "نشطة" : "متوقفة"}</td></tr>;
            })}</tbody>
          </table>
        </div>
      </section>

      <section className="admin-section-gap">
        <div className="section-head"><div><h2>آخر ترجمات الواجهة</h2></div></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>اللغة</th><th>Key</th><th>القيمة</th></tr></thead>
            <tbody>{translationRows?.map((row) => {
              const locale = Array.isArray(row.locales) ? row.locales[0] : row.locales;
              return <tr key={`${row.locale_id}-${row.translation_key}`}><td>{locale?.native_name ?? locale?.code ?? "-"}</td><td>{row.translation_key}</td><td className="wrap-cell">{row.translation_value}</td></tr>;
            })}</tbody>
          </table>
        </div>
      </section>
    </>
  );
}
