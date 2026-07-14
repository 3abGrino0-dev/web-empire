begin;

-- استخدام عنوان Gemini الافتراضي الموجود داخل Adapter.
-- يمنع وجود curl أو مسار model كامل داخل base_url.
update public.ai_providers
set
  name = 'Google Gemini',
  base_url = null,
  is_active = true,
  updated_at = now()
where adapter_type = 'gemini_generate_content';

-- إنشاء نموذج Gemini مستقر وربطه بـ alias موحد.
insert into public.ai_models (
  provider_id,
  name,
  model_key,
  alias,
  capabilities,
  input_cost_per_million_usd,
  output_cost_per_million_usd,
  cached_input_cost_per_million_usd,
  max_output_tokens,
  priority,
  is_active,
  pricing_effective_from
)
select
  provider.id,
  'Gemini 3.5 Flash',
  'gemini-3.5-flash',
  'standard',
  array['text']::text[],
  0,
  0,
  0,
  4096,
  100,
  true,
  now()
from public.ai_providers provider
where provider.adapter_type = 'gemini_generate_content'
on conflict (provider_id, model_key, alias) do update
set
  name = excluded.name,
  capabilities = excluded.capabilities,
  max_output_tokens = excluded.max_output_tokens,
  priority = excluded.priority,
  is_active = true;

-- ربط جميع أدوات الذكاء الاصطناعي بالنموذج ذي alias = standard.
update public.tools
set
  model_alias = 'standard',
  provider_strategy = 'primary_with_fallback',
  updated_at = now()
where engine_type in ('ai_text', 'ai_structured');

commit;
