-- Web Empire — Local Media Tools Pack
-- Adds legal direct-file downloading and private browser-side video processing.
-- No DRM bypass, social-platform extraction, or server-side media proxying.

begin;

insert into public.categories(
  slug, name_ar, name_en, description, icon, style_key, sort_order, is_active
)
values (
  'media-tools',
  'أدوات الفيديو والوسائط',
  'Video & Media Tools',
  'أدوات محلية لتحميل الملفات المباشرة وتحويل وضغط وقص الفيديو داخل المتصفح.',
  'video',
  'violet',
  600,
  true
)
on conflict (slug) do update set
  name_ar = excluded.name_ar,
  name_en = excluded.name_en,
  description = excluded.description,
  icon = excluded.icon,
  style_key = excluded.style_key,
  sort_order = excluded.sort_order,
  is_active = true;

insert into public.category_translations(category_id, locale_id, name, description)
select category.id, locale.id, seed.name, seed.description
from (
  values
    (
      'ar',
      'أدوات الفيديو والوسائط',
      'تحميل الملفات المباشرة وتحويل وضغط وقص الفيديو محليًا داخل المتصفح.'
    ),
    (
      'en',
      'Video & Media Tools',
      'Download direct media files and convert, compress, or trim video locally in the browser.'
    )
) as seed(locale_code, name, description)
join public.categories category on category.slug = 'media-tools'
join public.locales locale on locale.code = seed.locale_code
on conflict (category_id, locale_id) do update set
  name = excluded.name,
  description = excluded.description,
  updated_at = now();

create temporary table media_tool_seed (
  slug text primary key,
  title_ar text not null,
  title_en text not null,
  description_ar text not null,
  description_en text not null,
  runtime_config jsonb not null,
  sort_order integer not null,
  is_featured boolean not null
) on commit drop;

insert into media_tool_seed(
  slug, title_ar, title_en, description_ar, description_en,
  runtime_config, sort_order, is_featured
)
values
  (
    'direct-video-downloader',
    'تحميل فيديو من رابط مباشر',
    'Direct Video Downloader',
    'نزّل ملف فيديو مباشر تملكه أو لديك تصريح باستخدامه، دون تجاوز حماية المنصات أو DRM.',
    'Download a direct video file that you own or are authorized to use, without bypassing platform protections or DRM.',
    '{"runtimeKind":"video_downloader","maxDownloadMb":500,"localProcessing":true,"legalUseOnly":true}'::jsonb,
    6000,
    true
  ),
  (
    'video-format-converter',
    'محول صيغ الفيديو',
    'Video Format Converter',
    'حوّل الفيديو محليًا بين MP4 وWebM وMOV أو استخرج الصوت بصيغة MP3 وWAV.',
    'Convert video locally between MP4, WebM, and MOV, or extract audio as MP3 or WAV.',
    '{"runtimeKind":"video_converter","maxFileSizeMb":250,"localProcessing":true,"formats":["mp4","webm","mov","mp3","wav"]}'::jsonb,
    6001,
    true
  ),
  (
    'video-compressor',
    'ضاغط الفيديو',
    'Video Compressor',
    'قلّل حجم الفيديو مع اختيار الجودة والدقة، وتتم المعالجة داخل جهازك.',
    'Reduce video size with selectable quality and resolution while processing stays on your device.',
    '{"runtimeKind":"video_compressor","maxFileSizeMb":250,"localProcessing":true,"formats":["mp4","webm","mov"]}'::jsonb,
    6002,
    true
  ),
  (
    'video-trimmer',
    'قص الفيديو أونلاين',
    'Online Video Trimmer',
    'حدد وقت البداية والنهاية واقص الفيديو محليًا دون رفع الملف إلى الخادم.',
    'Set start and end times and trim video locally without uploading it to the server.',
    '{"runtimeKind":"video_trimmer","maxFileSizeMb":250,"localProcessing":true,"formats":["mp4","webm","mov"]}'::jsonb,
    6003,
    false
  );

insert into public.tools(
  slug,
  title_ar,
  title_en,
  short_description,
  category_id,
  engine_type,
  input_schema,
  output_schema,
  runtime_config,
  provider_strategy,
  model_alias,
  prompt_template,
  pricing_mode,
  fixed_points,
  minimum_points,
  cost_multiplier,
  requires_auth,
  is_featured,
  is_active,
  sort_order,
  seo_title,
  seo_description
)
select
  seed.slug,
  seed.title_ar,
  seed.title_en,
  seed.description_ar,
  category.id,
  'custom_runtime'::public.tool_engine_type,
  '{"fields":[],"submitLabel":"تشغيل الأداة"}'::jsonb,
  '{}'::jsonb,
  seed.runtime_config,
  'primary_with_fallback'::public.provider_strategy_type,
  null,
  null,
  'free'::public.pricing_mode_type,
  0,
  0,
  1,
  false,
  seed.is_featured,
  true,
  seed.sort_order,
  seed.title_ar || ' مجانًا | أمبراطورية الويب',
  seed.description_ar
from media_tool_seed seed
join public.categories category on category.slug = 'media-tools'
on conflict (slug) do update set
  title_ar = excluded.title_ar,
  title_en = excluded.title_en,
  short_description = excluded.short_description,
  category_id = excluded.category_id,
  engine_type = excluded.engine_type,
  input_schema = excluded.input_schema,
  output_schema = excluded.output_schema,
  runtime_config = excluded.runtime_config,
  provider_strategy = excluded.provider_strategy,
  model_alias = null,
  prompt_template = null,
  pricing_mode = excluded.pricing_mode,
  fixed_points = 0,
  minimum_points = 0,
  cost_multiplier = 1,
  requires_auth = false,
  is_featured = excluded.is_featured,
  is_active = true,
  sort_order = excluded.sort_order,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  updated_at = now();

insert into public.tool_translations(
  tool_id,
  locale_id,
  title,
  short_description,
  seo_title,
  seo_description,
  prompt_template_override
)
select
  tool.id,
  locale.id,
  case when locale.code = 'ar' then seed.title_ar else seed.title_en end,
  case when locale.code = 'ar' then seed.description_ar else seed.description_en end,
  case
    when locale.code = 'ar' then seed.title_ar || ' مجانًا | أمبراطورية الويب'
    else seed.title_en || ' Free | Web Empire'
  end,
  case when locale.code = 'ar' then seed.description_ar else seed.description_en end,
  null
from media_tool_seed seed
join public.tools tool on tool.slug = seed.slug
join public.locales locale on locale.code in ('ar', 'en')
on conflict (tool_id, locale_id) do update set
  title = excluded.title,
  short_description = excluded.short_description,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  prompt_template_override = null,
  updated_at = now();

commit;
