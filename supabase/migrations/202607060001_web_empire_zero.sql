create extension if not exists pgcrypto;
create extension if not exists supabase_vault;

do $$ begin
  create type public.tool_engine_type as enum (
    'formula','text_transform','ai_text','ai_structured',
    'http_api','webhook','workflow','custom_runtime'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.provider_adapter_type as enum (
    'openai_responses','anthropic_messages','gemini_generate_content',
    'openai_compatible','custom_http'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.provider_strategy_type as enum (
    'manual','lowest_cost','primary_with_fallback'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.pricing_mode_type as enum ('free','fixed','dynamic');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_ar text not null,
  name_en text not null,
  description text not null default '',
  icon text not null default 'sparkles',
  style_key text not null default 'violet',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.tools (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_ar text not null,
  title_en text not null,
  short_description text not null,
  category_id uuid not null references public.categories(id) on delete restrict,
  engine_type public.tool_engine_type not null,
  input_schema jsonb not null default '{"fields":[],"submitLabel":"تشغيل"}'::jsonb,
  output_schema jsonb not null default '{}'::jsonb,
  runtime_config jsonb not null default '{}'::jsonb,
  provider_strategy public.provider_strategy_type not null default 'primary_with_fallback',
  model_alias text,
  prompt_template text,
  pricing_mode public.pricing_mode_type not null default 'free',
  fixed_points integer not null default 0 check (fixed_points >= 0),
  minimum_points integer not null default 0 check (minimum_points >= 0),
  cost_multiplier numeric(12,4) not null default 1 check (cost_multiplier > 0),
  requires_auth boolean not null default false,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  adapter_type public.provider_adapter_type not null,
  base_url text,
  secret_id uuid,
  config jsonb not null default '{}'::jsonb,
  priority integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_models (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.ai_providers(id) on delete cascade,
  name text not null,
  model_key text not null,
  alias text not null default 'standard',
  capabilities text[] not null default array['text']::text[],
  input_cost_per_million_usd numeric(14,6) not null default 0,
  output_cost_per_million_usd numeric(14,6) not null default 0,
  cached_input_cost_per_million_usd numeric(14,6) not null default 0,
  max_output_tokens integer not null default 4096,
  priority integer not null default 100,
  is_active boolean not null default true,
  pricing_effective_from timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(provider_id, model_key, alias)
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  risk_level text not null default 'low'
    check (risk_level in ('low','medium','high','critical')),
  status text not null default 'draft'
    check (status in ('draft','review','approved','active','disabled')),
  current_version_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.skill_versions (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references public.skills(id) on delete cascade,
  version_number integer not null,
  instructions text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(skill_id, version_number)
);

alter table public.skills
  drop constraint if exists skills_current_version_id_fkey;

alter table public.skills
  add constraint skills_current_version_id_fkey
  foreign key (current_version_id)
  references public.skill_versions(id)
  on delete set null;

create table if not exists public.tool_skills (
  tool_id uuid not null references public.tools(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  sort_order integer not null default 0,
  primary key(tool_id, skill_id)
);

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_ar text not null,
  name_en text not null,
  description text not null default '',
  price_sar numeric(12,2) not null default 0,
  monthly_credits integer not null default 0,
  daily_ai_runs integer,
  max_output_tokens integer,
  features jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.plans(id),
  status text not null default 'active',
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_one_active_subscription
  on public.user_subscriptions(user_id)
  where status = 'active';

create table if not exists public.credit_wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance bigint not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.tool_runs (
  id uuid primary key default gen_random_uuid(),
  tool_id uuid not null references public.tools(id) on delete restrict,
  user_id uuid references auth.users(id) on delete set null,
  provider_id uuid references public.ai_providers(id) on delete set null,
  model_id uuid references public.ai_models(id) on delete set null,
  status text not null default 'queued'
    check (status in ('queued','running','completed','failed','cancelled')),
  input_payload jsonb not null default '{}'::jsonb,
  output_payload jsonb,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  cached_input_tokens integer not null default 0,
  credits_reserved integer not null default 0,
  credits_charged integer not null default 0,
  provider_response_id text,
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.credit_reservations (
  tool_run_id uuid primary key references public.tool_runs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reserved_amount bigint not null check (reserved_amount >= 0),
  actual_amount bigint,
  status text not null default 'reserved'
    check (status in ('reserved','settled','released')),
  created_at timestamptz not null default now(),
  settled_at timestamptz
);

create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tool_run_id uuid references public.tool_runs(id) on delete set null,
  transaction_type text not null
    check (transaction_type in (
      'grant','reserve','charge','release','refund','admin_adjustment'
    )),
  amount bigint not null,
  balance_before bigint not null,
  balance_after bigint not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.provider_usage (
  id uuid primary key default gen_random_uuid(),
  tool_run_id uuid not null references public.tool_runs(id) on delete cascade,
  provider_id uuid references public.ai_providers(id) on delete set null,
  model_id uuid references public.ai_models(id) on delete set null,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  cached_input_tokens integer not null default 0,
  estimated_cost_usd numeric(16,8) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.platform_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.platform_settings(key, value)
values ('points_per_sar_provider_cost', '650'::jsonb)
on conflict (key) do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

create or replace function public.set_ai_provider_secret(
  p_provider_id uuid,
  p_secret text
)
returns uuid
language plpgsql
security definer
set search_path = public, vault
as $$
declare
  v_secret_id uuid;
  v_existing uuid;
begin
  select secret_id
  into v_existing
  from public.ai_providers
  where id = p_provider_id
  for update;

  if v_existing is null then
    select vault.create_secret(
      p_secret,
      'web_empire_provider_' || p_provider_id::text,
      'Web Empire AI provider secret'
    )
    into v_secret_id;

    update public.ai_providers
    set secret_id = v_secret_id,
        updated_at = now()
    where id = p_provider_id;
  else
    perform vault.update_secret(v_existing, p_secret);
    v_secret_id := v_existing;
  end if;

  return v_secret_id;
end;
$$;

create or replace function public.get_ai_provider_secret(
  p_provider_id uuid
)
returns text
language sql
security definer
set search_path = public, vault
as $$
  select ds.decrypted_secret
  from public.ai_providers p
  join vault.decrypted_secrets ds
    on ds.id = p.secret_id
  where p.id = p_provider_id;
$$;

revoke all on function public.set_ai_provider_secret(uuid, text)
  from public, anon, authenticated;

revoke all on function public.get_ai_provider_secret(uuid)
  from public, anon, authenticated;

grant execute on function public.set_ai_provider_secret(uuid, text)
  to service_role;

grant execute on function public.get_ai_provider_secret(uuid)
  to service_role;

create or replace function public.reserve_credits(
  p_user_id uuid,
  p_tool_run_id uuid,
  p_amount bigint
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_before bigint;
  v_after bigint;
begin
  if p_amount < 0 then
    raise exception 'INVALID_CREDIT_AMOUNT';
  end if;

  select balance
  into v_before
  from public.credit_wallets
  where user_id = p_user_id
  for update;

  if v_before is null then
    raise exception 'WALLET_MISSING';
  end if;

  if v_before < p_amount then
    raise exception 'INSUFFICIENT_CREDITS';
  end if;

  if exists(
    select 1
    from public.credit_reservations
    where tool_run_id = p_tool_run_id
  ) then
    raise exception 'RESERVATION_ALREADY_EXISTS';
  end if;

  v_after := v_before - p_amount;

  update public.credit_wallets
  set balance = v_after,
      updated_at = now()
  where user_id = p_user_id;

  insert into public.credit_reservations(
    tool_run_id,
    user_id,
    reserved_amount,
    status
  )
  values (
    p_tool_run_id,
    p_user_id,
    p_amount,
    'reserved'
  );

  insert into public.credit_transactions(
    user_id,
    tool_run_id,
    transaction_type,
    amount,
    balance_before,
    balance_after,
    description
  )
  values (
    p_user_id,
    p_tool_run_id,
    'reserve',
    -p_amount,
    v_before,
    v_after,
    'Tool run credit reservation'
  );

  return v_after;
end;
$$;

create or replace function public.settle_credits(
  p_user_id uuid,
  p_tool_run_id uuid,
  p_reserved bigint,
  p_actual bigint
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_before bigint;
  v_after bigint;
  v_delta bigint;
  v_stored_reserved bigint;
  v_status text;
begin
  if p_actual < 0 or p_reserved < 0 then
    raise exception 'INVALID_CREDIT_AMOUNT';
  end if;

  select reserved_amount, status
  into v_stored_reserved, v_status
  from public.credit_reservations
  where tool_run_id = p_tool_run_id
    and user_id = p_user_id
  for update;

  if v_status is distinct from 'reserved' then
    raise exception 'RESERVATION_NOT_ACTIVE';
  end if;

  if v_stored_reserved <> p_reserved then
    raise exception 'RESERVATION_AMOUNT_MISMATCH';
  end if;

  select balance
  into v_before
  from public.credit_wallets
  where user_id = p_user_id
  for update;

  v_delta := p_reserved - p_actual;
  v_after := v_before + v_delta;

  if v_after < 0 then
    raise exception 'INSUFFICIENT_CREDITS_FOR_SETTLEMENT';
  end if;

  update public.credit_wallets
  set balance = v_after,
      updated_at = now()
  where user_id = p_user_id;

  update public.credit_reservations
  set actual_amount = p_actual,
      status = 'settled',
      settled_at = now()
  where tool_run_id = p_tool_run_id;

  if v_delta > 0 then
    insert into public.credit_transactions(
      user_id,
      tool_run_id,
      transaction_type,
      amount,
      balance_before,
      balance_after,
      description
    )
    values (
      p_user_id,
      p_tool_run_id,
      'release',
      v_delta,
      v_before,
      v_after,
      'Unused reservation released after settlement'
    );
  elsif v_delta < 0 then
    insert into public.credit_transactions(
      user_id,
      tool_run_id,
      transaction_type,
      amount,
      balance_before,
      balance_after,
      description
    )
    values (
      p_user_id,
      p_tool_run_id,
      'charge',
      v_delta,
      v_before,
      v_after,
      'Usage exceeded reservation estimate'
    );
  end if;

  return v_after;
end;
$$;

create or replace function public.release_credits(
  p_user_id uuid,
  p_tool_run_id uuid,
  p_reserved bigint
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_before bigint;
  v_after bigint;
  v_stored_reserved bigint;
  v_status text;
begin
  select reserved_amount, status
  into v_stored_reserved, v_status
  from public.credit_reservations
  where tool_run_id = p_tool_run_id
    and user_id = p_user_id
  for update;

  if v_status is distinct from 'reserved' then
    return (
      select balance
      from public.credit_wallets
      where user_id = p_user_id
    );
  end if;

  if v_stored_reserved <> p_reserved then
    raise exception 'RESERVATION_AMOUNT_MISMATCH';
  end if;

  select balance
  into v_before
  from public.credit_wallets
  where user_id = p_user_id
  for update;

  v_after := v_before + p_reserved;

  update public.credit_wallets
  set balance = v_after,
      updated_at = now()
  where user_id = p_user_id;

  update public.credit_reservations
  set actual_amount = 0,
      status = 'released',
      settled_at = now()
  where tool_run_id = p_tool_run_id;

  insert into public.credit_transactions(
    user_id,
    tool_run_id,
    transaction_type,
    amount,
    balance_before,
    balance_after,
    description
  )
  values (
    p_user_id,
    p_tool_run_id,
    'release',
    p_reserved,
    v_before,
    v_after,
    'Failed tool run reservation released'
  );

  return v_after;
end;
$$;

revoke all on function public.reserve_credits(uuid, uuid, bigint)
  from public, anon, authenticated;

revoke all on function public.settle_credits(uuid, uuid, bigint, bigint)
  from public, anon, authenticated;

revoke all on function public.release_credits(uuid, uuid, bigint)
  from public, anon, authenticated;

grant execute on function public.reserve_credits(uuid, uuid, bigint)
  to service_role;

grant execute on function public.settle_credits(uuid, uuid, bigint, bigint)
  to service_role;

grant execute on function public.release_credits(uuid, uuid, bigint)
  to service_role;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_free_plan uuid;
  v_credits integer;
begin
  insert into public.profiles(id)
  values (new.id)
  on conflict do nothing;

  insert into public.credit_wallets(user_id, balance)
  values (new.id, 0)
  on conflict do nothing;

  select id, monthly_credits
  into v_free_plan, v_credits
  from public.plans
  where slug = 'free'
  limit 1;

  if v_free_plan is not null then
    insert into public.user_subscriptions(
      user_id,
      plan_id,
      status
    )
    values (
      new.id,
      v_free_plan,
      'active'
    )
    on conflict do nothing;

    if not exists(
      select 1
      from public.credit_transactions
      where user_id = new.id
        and description = 'Initial free plan credits'
    ) then
      update public.credit_wallets
      set balance = balance + v_credits
      where user_id = new.id;

      insert into public.credit_transactions(
        user_id,
        transaction_type,
        amount,
        balance_before,
        balance_after,
        description
      )
      values (
        new.id,
        'grant',
        v_credits,
        0,
        v_credits,
        'Initial free plan credits'
      );
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.admin_users enable row level security;
alter table public.categories enable row level security;
alter table public.tools enable row level security;
alter table public.ai_providers enable row level security;
alter table public.ai_models enable row level security;
alter table public.skills enable row level security;
alter table public.skill_versions enable row level security;
alter table public.tool_skills enable row level security;
alter table public.plans enable row level security;
alter table public.user_subscriptions enable row level security;
alter table public.credit_wallets enable row level security;
alter table public.tool_runs enable row level security;
alter table public.credit_reservations enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.provider_usage enable row level security;
alter table public.platform_settings enable row level security;

create policy "public read active categories"
on public.categories for select
using (is_active);

create policy "public read active tools"
on public.tools for select
using (is_active);

create policy "public read active plans"
on public.plans for select
using (is_active);

create policy "users read own profile"
on public.profiles for select
using (id = auth.uid());

create policy "users read own subscription"
on public.user_subscriptions for select
using (user_id = auth.uid());

create policy "users read own wallet"
on public.credit_wallets for select
using (user_id = auth.uid());

create policy "users read own runs"
on public.tool_runs for select
using (user_id = auth.uid());

create policy "users read own transactions"
on public.credit_transactions for select
using (user_id = auth.uid());

create policy "admins read admin users"
on public.admin_users for select
using (public.is_admin());

create policy "admins manage categories"
on public.categories for all
using (public.is_admin())
with check (public.is_admin());

create policy "admins manage tools"
on public.tools for all
using (public.is_admin())
with check (public.is_admin());

create policy "admins manage providers"
on public.ai_providers for all
using (public.is_admin())
with check (public.is_admin());

create policy "admins manage models"
on public.ai_models for all
using (public.is_admin())
with check (public.is_admin());

create policy "admins manage skills"
on public.skills for all
using (public.is_admin())
with check (public.is_admin());

create policy "admins manage skill versions"
on public.skill_versions for all
using (public.is_admin())
with check (public.is_admin());

create policy "admins manage tool skills"
on public.tool_skills for all
using (public.is_admin())
with check (public.is_admin());

create policy "admins manage plans"
on public.plans for all
using (public.is_admin())
with check (public.is_admin());

create policy "admins read subscriptions"
on public.user_subscriptions for select
using (public.is_admin());

create policy "admins read wallets"
on public.credit_wallets for select
using (public.is_admin());

create policy "admins read runs"
on public.tool_runs for select
using (public.is_admin());

create policy "admins read reservations"
on public.credit_reservations for select
using (public.is_admin());

create policy "admins read transactions"
on public.credit_transactions for select
using (public.is_admin());

create policy "admins read usage"
on public.provider_usage for select
using (public.is_admin());

create policy "admins manage settings"
on public.platform_settings for all
using (public.is_admin())
with check (public.is_admin());

create index if not exists idx_tools_category
  on public.tools(category_id);

create index if not exists idx_tools_active_sort
  on public.tools(is_active, sort_order);

create index if not exists idx_models_alias_active
  on public.ai_models(alias, is_active, priority);

create index if not exists idx_tool_runs_user_created
  on public.tool_runs(user_id, created_at desc);

create index if not exists idx_tool_runs_status
  on public.tool_runs(status);

create index if not exists idx_credit_transactions_user_created
  on public.credit_transactions(user_id, created_at desc);

insert into public.categories(
  slug,
  name_ar,
  name_en,
  description,
  style_key,
  sort_order
)
values
  (
    'ai-tools',
    'أدوات الذكاء الاصطناعي',
    'AI Tools',
    'كتابة وتحليل وإنتاج بالذكاء الاصطناعي.',
    'violet',
    10
  ),
  (
    'math-tools',
    'أدوات حسابية',
    'Math Tools',
    'حاسبات يومية سريعة.',
    'blue',
    20
  ),
  (
    'text-tools',
    'أدوات النصوص',
    'Text Tools',
    'معالجة النصوص والمحتوى.',
    'green',
    30
  )
on conflict (slug) do nothing;

insert into public.plans(
  slug,
  name_ar,
  name_en,
  description,
  price_sar,
  monthly_credits,
  sort_order
)
values
  (
    'free',
    'مجاني',
    'Free',
    'للتجربة والاستخدام الخفيف.',
    0,
    300,
    10
  ),
  (
    'basic',
    'أساسي',
    'Basic',
    'للاستخدام اليومي.',
    29,
    3000,
    20
  ),
  (
    'pro',
    'احترافي',
    'Pro',
    'للصناع والمسوقين.',
    79,
    12000,
    30
  ),
  (
    'business',
    'أعمال',
    'Business',
    'للفرق والاستخدام الكثيف.',
    199,
    40000,
    40
  )
on conflict (slug) do nothing;

insert into public.tools(
  slug,
  title_ar,
  title_en,
  short_description,
  category_id,
  engine_type,
  input_schema,
  runtime_config,
  pricing_mode,
  is_featured,
  is_active,
  sort_order
)
select
  'percentage-calculator',
  'حاسبة النسبة المئوية',
  'Percentage Calculator',
  'احسب نسبة قيمة من إجمالي بسرعة.',
  c.id,
  'formula',
  '{
    "submitLabel":"احسب النسبة",
    "fields":[
      {"key":"value","label":"القيمة","type":"number","required":true},
      {"key":"total","label":"الإجمالي","type":"number","required":true}
    ]
  }'::jsonb,
  '{"expression":"(value / total) * 100"}'::jsonb,
  'free',
  true,
  true,
  10
from public.categories c
where c.slug = 'math-tools'
on conflict (slug) do nothing;

insert into public.tools(
  slug,
  title_ar,
  title_en,
  short_description,
  category_id,
  engine_type,
  input_schema,
  runtime_config,
  provider_strategy,
  model_alias,
  prompt_template,
  pricing_mode,
  minimum_points,
  cost_multiplier,
  requires_auth,
  is_featured,
  is_active,
  sort_order
)
select
  'ai-content-writer',
  'مساعد كتابة المحتوى',
  'AI Content Writer',
  'أنشئ محتوى عربيًا حسب الموضوع والنبرة والجمهور.',
  c.id,
  'ai_text',
  '{
    "submitLabel":"إنشاء المحتوى",
    "fields":[
      {
        "key":"topic",
        "label":"الموضوع",
        "type":"textarea",
        "required":true,
        "maxLength":2000
      },
      {
        "key":"content_type",
        "label":"نوع المحتوى",
        "type":"select",
        "required":true,
        "options":[
          {"label":"مقال","value":"article"},
          {"label":"منشور","value":"social"},
          {"label":"وصف منتج","value":"product"}
        ],
        "defaultValue":"article"
      },
      {
        "key":"tone",
        "label":"النبرة",
        "type":"select",
        "required":true,
        "options":[
          {"label":"احترافية","value":"professional"},
          {"label":"تسويقية","value":"marketing"},
          {"label":"ودودة","value":"friendly"}
        ],
        "defaultValue":"professional"
      },
      {
        "key":"audience",
        "label":"الجمهور",
        "type":"text",
        "placeholder":"مثال: أصحاب المتاجر السعودية"
      }
    ]
  }'::jsonb,
  '{"max_output_tokens":2500}'::jsonb,
  'primary_with_fallback',
  'standard',
  'أنشئ {{content_type}} باللغة العربية عن الموضوع التالي:

{{topic}}

النبرة: {{tone}}
الجمهور: {{audience}}

أخرج محتوى طبيعيًا، واضحًا، منظمًا، وابتعد عن الحشو والتكرار.',
  'dynamic',
  5,
  1,
  true,
  true,
  true,
  20
from public.categories c
where c.slug = 'ai-tools'
on conflict (slug) do nothing;

insert into public.skills(
  name,
  slug,
  description,
  risk_level,
  status
)
values (
  'كاتب عربي احترافي',
  'professional-arabic-writer',
  'أساس عام للكتابة العربية الحديثة.',
  'low',
  'active'
)
on conflict (slug) do nothing;

do $$
declare
  v_skill uuid;
  v_version uuid;
  v_tool uuid;
begin
  select id
  into v_skill
  from public.skills
  where slug = 'professional-arabic-writer';

  if not exists(
    select 1
    from public.skill_versions
    where skill_id = v_skill
      and version_number = 1
  ) then
    insert into public.skill_versions(
      skill_id,
      version_number,
      instructions
    )
    values (
      v_skill,
      1,
      'اكتب باللغة العربية الفصحى الحديثة.
استخدم جملًا واضحة وطبيعية.
تجنب الحشو والتكرار.
راعِ السوق السعودي والخليجي عندما يكون السياق مناسبًا.
لا تخترع حقائق أو أرقامًا غير متوفرة في المدخل.'
    )
    returning id into v_version;

    update public.skills
    set current_version_id = v_version
    where id = v_skill;
  end if;

  select id
  into v_tool
  from public.tools
  where slug = 'ai-content-writer';

  insert into public.tool_skills(
    tool_id,
    skill_id,
    sort_order
  )
  values (
    v_tool,
    v_skill,
    10
  )
  on conflict do nothing;
end $$;

-- Backfill users that existed before this migration.
insert into public.profiles(id)
select id
from auth.users
on conflict do nothing;

insert into public.credit_wallets(user_id, balance)
select id, 0
from auth.users
on conflict do nothing;


with free_plan as (
  select id, monthly_credits
  from public.plans
  where slug = 'free'
  limit 1
)
insert into public.user_subscriptions(
  user_id,
  plan_id,
  status
)
select
  u.id,
  f.id,
  'active'
from auth.users u
cross join free_plan f
where not exists(
  select 1
  from public.user_subscriptions s
  where s.user_id = u.id
    and s.status = 'active'
);

with free_plan as (
  select monthly_credits
  from public.plans
  where slug = 'free'
  limit 1
),
eligible as (
  select u.id as user_id, f.monthly_credits
  from auth.users u
  cross join free_plan f
  where not exists(
    select 1
    from public.credit_transactions t
    where t.user_id = u.id
      and t.description = 'Initial free plan credits'
  )
)
update public.credit_wallets w
set balance = w.balance + e.monthly_credits,
    updated_at = now()
from eligible e
where w.user_id = e.user_id;

with free_plan as (
  select monthly_credits
  from public.plans
  where slug = 'free'
  limit 1
),
eligible as (
  select u.id as user_id, f.monthly_credits
  from auth.users u
  cross join free_plan f
  where not exists(
    select 1
    from public.credit_transactions t
    where t.user_id = u.id
      and t.description = 'Initial free plan credits'
  )
)
insert into public.credit_transactions(
  user_id,
  transaction_type,
  amount,
  balance_before,
  balance_after,
  description
)
select
  e.user_id,
  'grant',
  e.monthly_credits,
  0,
  e.monthly_credits,
  'Initial free plan credits'
from eligible e;
