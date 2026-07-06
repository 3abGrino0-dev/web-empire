create table if not exists public.locales (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[a-z]{2,3}(-[A-Za-z0-9]{2,8})?$'),
  locale_code text not null,
  name text not null,
  native_name text not null,
  direction text not null default 'ltr' check (direction in ('rtl','ltr')),
  fallback_locale_id uuid references public.locales(id) on delete set null,
  is_default boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_locales_single_default
  on public.locales(is_default)
  where is_default = true;

create table if not exists public.country_locale_rules (
  country_code text primary key check (country_code ~ '^[A-Z]{2}$'),
  country_name text not null,
  locale_id uuid not null references public.locales(id) on delete restrict,
  fallback_locale_id uuid references public.locales(id) on delete set null,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.country_groups (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  locale_id uuid references public.locales(id) on delete set null,
  fallback_locale_id uuid references public.locales(id) on delete set null,
  priority integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.country_group_members (
  group_id uuid not null references public.country_groups(id) on delete cascade,
  country_code text not null check (country_code ~ '^[A-Z]{2}$'),
  primary key (group_id, country_code)
);

create table if not exists public.user_locale_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  locale_id uuid not null references public.locales(id) on delete restrict,
  updated_at timestamptz not null default now()
);

create table if not exists public.ui_translations (
  locale_id uuid not null references public.locales(id) on delete cascade,
  translation_key text not null,
  translation_value text not null,
  updated_at timestamptz not null default now(),
  primary key (locale_id, translation_key)
);

create table if not exists public.category_translations (
  category_id uuid not null references public.categories(id) on delete cascade,
  locale_id uuid not null references public.locales(id) on delete cascade,
  name text not null,
  description text not null default '',
  updated_at timestamptz not null default now(),
  primary key (category_id, locale_id)
);

create table if not exists public.tool_translations (
  tool_id uuid not null references public.tools(id) on delete cascade,
  locale_id uuid not null references public.locales(id) on delete cascade,
  title text not null,
  short_description text not null default '',
  seo_title text,
  seo_description text,
  prompt_template_override text,
  updated_at timestamptz not null default now(),
  primary key (tool_id, locale_id)
);

create table if not exists public.tool_field_translations (
  tool_id uuid not null references public.tools(id) on delete cascade,
  locale_id uuid not null references public.locales(id) on delete cascade,
  field_key text not null,
  label text not null,
  placeholder text,
  help_text text,
  options jsonb,
  updated_at timestamptz not null default now(),
  primary key (tool_id, locale_id, field_key)
);

create table if not exists public.plan_translations (
  plan_id uuid not null references public.plans(id) on delete cascade,
  locale_id uuid not null references public.locales(id) on delete cascade,
  name text not null,
  description text not null default '',
  updated_at timestamptz not null default now(),
  primary key (plan_id, locale_id)
);

create table if not exists public.theme_presets (
  preset_key text primary key,
  name text not null,
  description text not null default '',
  config jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.site_appearance (
  singleton boolean primary key default true check (singleton),
  preset_key text not null references public.theme_presets(preset_key) on delete restrict,
  primary_color text not null default '#7C3AED',
  accent_color text not null default '#06B6D4',
  background_color text not null default '#F5F7FB',
  surface_color text not null default '#FFFFFF',
  ink_color text not null default '#0B1324',
  dark_background_color text not null default '#050B16',
  dark_surface_color text not null default '#0B1628',
  dark_ink_color text not null default '#F8FAFC',
  header_style text not null default 'floating' check (header_style in ('classic','centered','dashboard','floating')),
  hero_style text not null default 'ai_search' check (hero_style in ('statement','ai_search','dashboard_preview','categories','tool_discovery')),
  card_style text not null default 'soft' check (card_style in ('flat','soft','floating','glass','outlined')),
  border_radius integer not null default 20 check (border_radius between 0 and 40),
  ui_density text not null default 'comfortable' check (ui_density in ('compact','comfortable','spacious')),
  desktop_columns integer not null default 3 check (desktop_columns between 2 and 6),
  tablet_columns integer not null default 2 check (tablet_columns between 1 and 4),
  mobile_columns integer not null default 1 check (mobile_columns between 1 and 2),
  default_color_mode text not null default 'system' check (default_color_mode in ('light','dark','system')),
  font_preset text not null default 'modern' check (font_preset in ('modern','professional','bold','editorial','compact')),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_identity_translations (
  locale_id uuid primary key references public.locales(id) on delete cascade,
  site_name text not null,
  site_name_en text,
  tagline text not null default '',
  home_seo_title text,
  home_seo_description text,
  updated_at timestamptz not null default now()
);

insert into public.locales(code, locale_code, name, native_name, direction, is_default, is_active, sort_order)
values
  ('ar', 'ar-SA', 'Arabic', 'العربية', 'rtl', true, true, 10),
  ('en', 'en-US', 'English', 'English', 'ltr', false, true, 20),
  ('fr', 'fr-FR', 'French', 'Français', 'ltr', false, true, 30),
  ('tr', 'tr-TR', 'Turkish', 'Türkçe', 'ltr', false, true, 40),
  ('ur', 'ur-PK', 'Urdu', 'اردو', 'rtl', false, true, 50)
on conflict (code) do update set
  locale_code = excluded.locale_code,
  name = excluded.name,
  native_name = excluded.native_name,
  direction = excluded.direction,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

update public.locales l
set fallback_locale_id = en.id
from public.locales en
where en.code = 'en' and l.code <> 'en' and l.fallback_locale_id is null;

insert into public.country_locale_rules(country_code, country_name, locale_id, fallback_locale_id)
select data.country_code, data.country_name, lang.id, en.id
from (
  values
    ('SA','Saudi Arabia','ar'), ('AE','United Arab Emirates','ar'),
    ('KW','Kuwait','ar'), ('QA','Qatar','ar'), ('BH','Bahrain','ar'),
    ('OM','Oman','ar'), ('YE','Yemen','ar'), ('IQ','Iraq','ar'),
    ('JO','Jordan','ar'), ('LB','Lebanon','ar'), ('SY','Syria','ar'),
    ('PS','Palestine','ar'), ('EG','Egypt','ar'),
    ('TR','Türkiye','tr'), ('FR','France','fr'), ('PK','Pakistan','ur'),
    ('US','United States','en'), ('GB','United Kingdom','en'),
    ('CA','Canada','en'), ('AU','Australia','en'), ('NZ','New Zealand','en')
) as data(country_code, country_name, locale_code)
join public.locales lang on lang.code = data.locale_code
join public.locales en on en.code = 'en'
on conflict (country_code) do update set
  country_name = excluded.country_name,
  locale_id = excluded.locale_id,
  fallback_locale_id = excluded.fallback_locale_id,
  is_active = true,
  updated_at = now();

insert into public.country_groups(slug, name, locale_id, fallback_locale_id, priority)
select 'arabic-market', 'Arabic Market Countries', ar.id, en.id, 10
from public.locales ar cross join public.locales en
where ar.code = 'ar' and en.code = 'en'
on conflict (slug) do nothing;

insert into public.country_group_members(group_id, country_code)
select g.id, code
from public.country_groups g
cross join unnest(array['SA','AE','KW','QA','BH','OM','YE','IQ','JO','LB','SY','PS','EG']) code
where g.slug = 'arabic-market'
on conflict do nothing;

insert into public.theme_presets(preset_key, name, description, config, sort_order)
values
  ('minimal', 'Minimal Clean', 'واجهة نظيفة ومساحات واسعة وحدود هادئة.', '{"shadow":"low","hero":"statement"}', 10),
  ('ai_saas', 'AI SaaS', 'واجهة أدوات وذكاء اصطناعي متوازنة.', '{"shadow":"medium","hero":"ai_search"}', 20),
  ('dark_premium', 'Dark Premium', 'واجهة داكنة فخمة ومركزة.', '{"shadow":"high","hero":"statement"}', 30),
  ('glass', 'Glass UI', 'بطاقات شفافة وتأثيرات زجاجية محسوبة.', '{"shadow":"medium","hero":"ai_search"}', 40),
  ('neo', 'Neo Bold', 'حدود قوية وتباين وTypography جريء.', '{"shadow":"none","hero":"categories"}', 50),
  ('corporate', 'Corporate', 'واجهة أعمال احترافية وهادئة.', '{"shadow":"low","hero":"dashboard_preview"}', 60)
on conflict (preset_key) do update set
  name = excluded.name,
  description = excluded.description,
  config = excluded.config,
  sort_order = excluded.sort_order,
  is_active = true;

insert into public.site_appearance(singleton, preset_key)
values (true, 'ai_saas')
on conflict (singleton) do nothing;

insert into public.site_identity_translations(locale_id, site_name, site_name_en, tagline, home_seo_title, home_seo_description)
select l.id,
  case l.code
    when 'ar' then 'إمبراطورية الويب'
    when 'fr' then 'Web Empire'
    when 'tr' then 'Web Empire'
    when 'ur' then 'ویب ایمپائر'
    else 'Web Empire'
  end,
  'Web Empire',
  case l.code
    when 'ar' then 'أدواتك. ذكاؤك. إمبراطوريتك.'
    when 'fr' then 'Vos outils. Votre intelligence. Votre empire.'
    when 'tr' then 'Araçların. Zekân. İmparatorluğun.'
    when 'ur' then 'آپ کے اوزار۔ آپ کی ذہانت۔ آپ کی سلطنت۔'
    else 'Your tools. Your intelligence. Your empire.'
  end,
  case l.code
    when 'ar' then 'إمبراطورية الويب — أدوات وذكاء اصطناعي في منصة واحدة'
    else 'Web Empire — Tools and AI in one platform'
  end,
  case l.code
    when 'ar' then 'منصة أدوات وذكاء اصطناعي متعددة اللغات والمزودات بنظام نقاط ومصنع أدوات قابل للتوسع.'
    else 'A multilingual, multi-provider tools and AI platform with credits and an extensible tool factory.'
  end
from public.locales l
on conflict (locale_id) do update set
  site_name = excluded.site_name,
  site_name_en = excluded.site_name_en,
  tagline = excluded.tagline,
  home_seo_title = excluded.home_seo_title,
  home_seo_description = excluded.home_seo_description,
  updated_at = now();

insert into public.category_translations(category_id, locale_id, name, description)
select c.id, l.id,
  case
    when l.code = 'ar' then c.name_ar
    when l.code = 'en' then c.name_en
    when c.slug = 'ai-tools' and l.code = 'fr' then 'Outils IA'
    when c.slug = 'math-tools' and l.code = 'fr' then 'Outils mathématiques'
    when c.slug = 'text-tools' and l.code = 'fr' then 'Outils de texte'
    else c.name_en
  end,
  case when l.code = 'ar' then c.description else c.description end
from public.categories c
cross join public.locales l
on conflict (category_id, locale_id) do nothing;

insert into public.tool_translations(tool_id, locale_id, title, short_description, seo_title, seo_description, prompt_template_override)
select t.id, l.id,
  case when l.code = 'ar' then t.title_ar else t.title_en end,
  t.short_description,
  coalesce(t.seo_title, case when l.code = 'ar' then t.title_ar else t.title_en end),
  coalesce(t.seo_description, t.short_description),
  case when l.code = 'ar' then t.prompt_template else null end
from public.tools t
cross join public.locales l
on conflict (tool_id, locale_id) do nothing;

insert into public.plan_translations(plan_id, locale_id, name, description)
select p.id, l.id,
  case when l.code = 'ar' then p.name_ar else p.name_en end,
  p.description
from public.plans p
cross join public.locales l
on conflict (plan_id, locale_id) do nothing;

insert into public.ui_translations(locale_id, translation_key, translation_value)
select l.id, data.translation_key,
  case l.code
    when 'ar' then data.ar
    when 'fr' then data.fr
    when 'tr' then data.tr
    when 'ur' then data.ur
    else data.en
  end
from public.locales l
cross join (
  values
    ('nav.home','الرئيسية','Home','Accueil','Ana Sayfa','ہوم'),
    ('nav.tools','الأدوات','Tools','Outils','Araçlar','اوزار'),
    ('nav.pricing','النقاط والخطط','Credits & Plans','Crédits et offres','Krediler ve Planlar','پوائنٹس اور پلانز'),
    ('nav.dashboard','مساحتي','My Space','Mon espace','Alanım','میری جگہ'),
    ('nav.login','تسجيل الدخول','Sign in','Connexion','Giriş yap','لاگ ان'),
    ('home.eyebrow','WEB EMPIRE','WEB EMPIRE','WEB EMPIRE','WEB EMPIRE','WEB EMPIRE'),
    ('home.title','إمبراطورية الويب','Web Empire','Web Empire','Web Empire','ویب ایمپائر'),
    ('home.description','منصة واحدة للأدوات السريعة والذكاء الاصطناعي، قابلة للتخصيص والتوسع من لوحة الإدارة.','One platform for fast tools and AI, customizable and extensible from the admin dashboard.','Une plateforme pour les outils rapides et l’IA, personnalisable depuis l’administration.','Hızlı araçlar ve yapay zekâ için yönetim panelinden özelleştirilebilen tek platform.','تیز اوزار اور مصنوعی ذہانت کے لیے ایک پلیٹ فارم۔'),
    ('home.explore','استعرض الأدوات','Explore tools','Explorer les outils','Araçları keşfet','اوزار دیکھیں'),
    ('home.plans','النقاط والخطط','Credits & plans','Crédits et offres','Krediler ve planlar','پوائنٹس اور پلانز'),
    ('tools.title','جميع الأدوات','All tools','Tous les outils','Tüm araçlar','تمام اوزار'),
    ('tools.description','اختر الأداة المناسبة. التنفيذ يأتي من محرك الأداة وليس من صفحة ثابتة.','Choose the right tool. Execution comes from the tool engine, not a fixed page.','Choisissez le bon outil. L’exécution vient du moteur de l’outil.','Doğru aracı seçin. Çalıştırma sabit sayfadan değil araç motorundan gelir.','درست اوزار منتخب کریں۔'),
    ('tool.result','النتيجة','Result','Résultat','Sonuç','نتیجہ'),
    ('tool.empty','املأ الحقول وشغّل الأداة. ستظهر النتيجة هنا.','Fill the fields and run the tool. The result will appear here.','Remplissez les champs et lancez l’outil. Le résultat apparaîtra ici.','Alanları doldurun ve aracı çalıştırın. Sonuç burada görünecek.','فیلڈز بھریں اور اوزار چلائیں۔'),
    ('pricing.title','خطط مبنية على النقاط','Plans built on credits','Offres basées sur les crédits','Kredi tabanlı planlar','پوائنٹس پر مبنی پلانز'),
    ('dashboard.title','مساحتي','My space','Mon espace','Alanım','میری جگہ'),
    ('common.free','مجاني','Free','Gratuit','Ücretsiz','مفت'),
    ('common.points','نقطة','points','crédits','kredi','پوائنٹس'),
    ('language.label','اللغة','Language','Langue','Dil','زبان')
) as data(translation_key, ar, en, fr, tr, ur)
on conflict (locale_id, translation_key) do nothing;

create or replace function public.set_default_locale(p_locale_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'ADMIN_REQUIRED';
  end if;

  update public.locales set is_default = false where is_default = true;
  update public.locales set is_default = true, is_active = true, updated_at = now() where id = p_locale_id;
end;
$$;

alter table public.locales enable row level security;
alter table public.country_locale_rules enable row level security;
alter table public.country_groups enable row level security;
alter table public.country_group_members enable row level security;
alter table public.user_locale_preferences enable row level security;
alter table public.ui_translations enable row level security;
alter table public.category_translations enable row level security;
alter table public.tool_translations enable row level security;
alter table public.tool_field_translations enable row level security;
alter table public.plan_translations enable row level security;
alter table public.theme_presets enable row level security;
alter table public.site_appearance enable row level security;
alter table public.site_identity_translations enable row level security;

create policy "public read active locales" on public.locales for select using (is_active);
create policy "public read active country rules" on public.country_locale_rules for select using (is_active);
create policy "public read active country groups" on public.country_groups for select using (is_active);
create policy "public read country group members" on public.country_group_members for select using (true);
create policy "public read ui translations" on public.ui_translations for select using (true);
create policy "public read category translations" on public.category_translations for select using (true);
create policy "public read tool translations" on public.tool_translations for select using (true);
create policy "public read field translations" on public.tool_field_translations for select using (true);
create policy "public read plan translations" on public.plan_translations for select using (true);
create policy "public read theme presets" on public.theme_presets for select using (is_active);
create policy "public read site appearance" on public.site_appearance for select using (true);
create policy "public read site identity" on public.site_identity_translations for select using (true);

create policy "users read own locale preference" on public.user_locale_preferences for select using (user_id = auth.uid());
create policy "users insert own locale preference" on public.user_locale_preferences for insert with check (user_id = auth.uid());
create policy "users update own locale preference" on public.user_locale_preferences for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "admins manage locales" on public.locales for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage country rules" on public.country_locale_rules for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage country groups" on public.country_groups for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage country group members" on public.country_group_members for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage ui translations" on public.ui_translations for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage category translations" on public.category_translations for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage tool translations" on public.tool_translations for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage field translations" on public.tool_field_translations for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage plan translations" on public.plan_translations for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage theme presets" on public.theme_presets for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage site appearance" on public.site_appearance for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage site identity" on public.site_identity_translations for all using (public.is_admin()) with check (public.is_admin());

create index if not exists idx_country_rules_locale on public.country_locale_rules(locale_id);
create index if not exists idx_ui_translations_locale on public.ui_translations(locale_id);
create index if not exists idx_tool_translations_locale on public.tool_translations(locale_id);
create index if not exists idx_plan_translations_locale on public.plan_translations(locale_id);
create index if not exists idx_category_translations_locale on public.category_translations(locale_id);
