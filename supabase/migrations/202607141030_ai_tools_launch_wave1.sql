begin;

-- Web Empire AI Tools Launch Wave 1
-- Six authenticated tools enabled for free production testing.

update public.categories
set is_active = true
where slug in (
  'ai-writing-tools',
  'social-media-tools'
);

update public.tools
set
  provider_strategy = 'primary_with_fallback',
  model_alias = 'standard',
  pricing_mode = 'free',
  fixed_points = 0,
  minimum_points = 0,
  requires_auth = true,
  is_featured = true,
  is_active = true,
  runtime_config =
    coalesce(runtime_config, '{}'::jsonb)
    || '{"beta":true,"provider_test_wave":"wave1"}'::jsonb,
  sort_order = case slug
    when 'content-writing-assistant' then 100
    when 'text-summarizer' then 110
    when 'content-rewriter' then 120
    when 'product-description-generator' then 130
    when 'social-post-generator' then 140
    when 'video-script-generator' then 150
    else sort_order
  end,
  updated_at = now()
where slug in (
  'content-writing-assistant',
  'content-rewriter',
  'text-summarizer',
  'product-description-generator',
  'social-post-generator',
  'video-script-generator'
);

do $$
declare
  v_ready_count integer;
begin
  select count(*) into v_ready_count
  from public.tools
  where slug in (
    'content-writing-assistant',
    'content-rewriter',
    'text-summarizer',
    'product-description-generator',
    'social-post-generator',
    'video-script-generator'
  )
    and engine_type = 'ai_text'
    and provider_strategy = 'primary_with_fallback'
    and model_alias = 'standard'
    and pricing_mode = 'free'
    and requires_auth = true
    and is_active = true;

  if v_ready_count <> 6 then
    raise exception
      'AI_TOOLS_LAUNCH_WAVE1_COUNT_MISMATCH:%',
      v_ready_count;
  end if;
end;
$$;

commit;
