import {
  updateAppearanceAction,
  updateSiteIdentityAction,
} from "@/actions/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function AppearanceAdminPage() {
  const supabase = createSupabaseAdminClient();
  const [
    { data: appearance },
    { data: presets },
    { data: locales },
    { data: identities },
  ] = await Promise.all([
    supabase.from("site_appearance").select("*").eq("singleton", true).single(),
    supabase.from("theme_presets").select("*").eq("is_active", true).order("sort_order"),
    supabase.from("locales").select("id, code, native_name").eq("is_active", true).order("sort_order"),
    supabase.from("site_identity_translations").select("*")
  ]);

  return (
    <>
      <div className="admin-head">
        <div className="eyebrow">VISUAL IDENTITY ENGINE</div>
        <h1>المظهر والهوية</h1>
        <p>اختر كل عنصر مستقلًا. لا توجد هوية لونية مفروضة على المشروع.</p>
      </div>

      <section className="panel">
        <form action={updateAppearanceAction} className="admin-form">
          <h2>محرك الواجهة</h2>
          <div className="form-grid">
            <label>Preset<select name="preset_key" defaultValue={appearance?.preset_key}>{presets?.map((preset) => <option key={preset.preset_key} value={preset.preset_key}>{preset.name}</option>)}</select></label>
            <label>Color Mode<select name="default_color_mode" defaultValue={appearance?.default_color_mode}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label>
            <label>Primary<input name="primary_color" type="color" defaultValue={appearance?.primary_color} /></label>
            <label>Accent<input name="accent_color" type="color" defaultValue={appearance?.accent_color} /></label>
            <label>Background<input name="background_color" type="color" defaultValue={appearance?.background_color} /></label>
            <label>Surface<input name="surface_color" type="color" defaultValue={appearance?.surface_color} /></label>
            <label>Text<input name="ink_color" type="color" defaultValue={appearance?.ink_color} /></label>
            <label>Dark Background<input name="dark_background_color" type="color" defaultValue={appearance?.dark_background_color} /></label>
            <label>Dark Surface<input name="dark_surface_color" type="color" defaultValue={appearance?.dark_surface_color} /></label>
            <label>Dark Text<input name="dark_ink_color" type="color" defaultValue={appearance?.dark_ink_color} /></label>
            <label>Header<select name="header_style" defaultValue={appearance?.header_style}><option value="classic">Classic</option><option value="centered">Centered</option><option value="dashboard">Dashboard</option><option value="floating">Floating</option></select></label>
            <label>Hero<select name="hero_style" defaultValue={appearance?.hero_style}><option value="statement">Statement</option><option value="ai_search">AI Search</option><option value="dashboard_preview">Dashboard Preview</option><option value="categories">Categories</option><option value="tool_discovery">Tool Discovery</option></select></label>
            <label>Cards<select name="card_style" defaultValue={appearance?.card_style}><option value="flat">Flat</option><option value="soft">Soft</option><option value="floating">Floating</option><option value="glass">Glass</option><option value="outlined">Outlined</option></select></label>
            <label>Radius<input name="border_radius" type="range" min="0" max="40" defaultValue={appearance?.border_radius} /></label>
            <label>Density<select name="ui_density" defaultValue={appearance?.ui_density}><option value="compact">Compact</option><option value="comfortable">Comfortable</option><option value="spacious">Spacious</option></select></label>
            <label>Font Preset<select name="font_preset" defaultValue={appearance?.font_preset}><option value="modern">Modern</option><option value="professional">Professional</option><option value="bold">Bold</option><option value="editorial">Editorial</option><option value="compact">Compact</option></select></label>
            <label>Desktop Columns<input name="desktop_columns" type="number" min="2" max="6" defaultValue={appearance?.desktop_columns} /></label>
            <label>Tablet Columns<input name="tablet_columns" type="number" min="1" max="4" defaultValue={appearance?.tablet_columns} /></label>
            <label>Mobile Columns<input name="mobile_columns" type="number" min="1" max="2" defaultValue={appearance?.mobile_columns} /></label>
          </div>
          <button className="button button-primary">حفظ المظهر</button>
        </form>
      </section>

      <section className="admin-section-gap">
        <div className="appearance-preview" style={{
          "--preview-primary": appearance?.primary_color,
          "--preview-accent": appearance?.accent_color,
          "--preview-background": appearance?.background_color,
          "--preview-surface": appearance?.surface_color,
          "--preview-ink": appearance?.ink_color,
        } as React.CSSProperties}>
          <div className="preview-bar"><span>♛ Web Empire</span><button>Action</button></div>
          <div className="preview-body"><div><span className="badge">Preview</span><h2>Identity Engine</h2><p>Primary + Accent + Surface + Layout controls.</p></div><div className="preview-cards"><span /><span /><span /></div></div>
        </div>
      </section>

      <section className="admin-section-gap">
        <div className="section-head"><div><h2>هوية الموقع حسب اللغة</h2></div></div>
        <div className="identity-grid">
          {locales?.map((locale) => {
            const identity = identities?.find((item) => item.locale_id === locale.id);
            return (
              <form action={updateSiteIdentityAction} className="panel admin-form" key={locale.id}>
                <input type="hidden" name="locale_id" value={locale.id} />
                <h3>{locale.native_name} <span className="badge">{locale.code}</span></h3>
                <label>اسم الموقع<input name="site_name" defaultValue={identity?.site_name ?? ""} required /></label>
                <label>English Name<input name="site_name_en" defaultValue={identity?.site_name_en ?? ""} /></label>
                <label>Tagline<input name="tagline" defaultValue={identity?.tagline ?? ""} /></label>
                <label>SEO Title<input name="home_seo_title" defaultValue={identity?.home_seo_title ?? ""} /></label>
                <label>SEO Description<textarea name="home_seo_description" defaultValue={identity?.home_seo_description ?? ""} /></label>
                <button className="button button-dark">حفظ {locale.native_name}</button>
              </form>
            );
          })}
        </div>
      </section>
    </>
  );
}
