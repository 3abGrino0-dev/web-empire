create table if not exists public.runtime_connections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  base_url text not null,
  auth_header text not null default 'Authorization',
  auth_prefix text not null default 'Bearer ',
  secret_id uuid,
  default_headers jsonb not null default '{}'::jsonb,
  max_timeout_ms integer not null default 30000 check (max_timeout_ms between 1000 and 60000),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (base_url ~ '^https://')
);

create table if not exists public.workflows (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workflow_steps (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references public.workflows(id) on delete cascade,
  step_key text not null,
  name text not null,
  step_type text not null check (step_type in (
    'template','formula','http_api','webhook','ai_text','ai_structured'
  )),
  sort_order integer not null default 0,
  config jsonb not null default '{}'::jsonb,
  continue_on_error boolean not null default false,
  created_at timestamptz not null default now(),
  unique(workflow_id, step_key)
);

create table if not exists public.workflow_step_runs (
  id uuid primary key default gen_random_uuid(),
  tool_run_id uuid not null references public.tool_runs(id) on delete cascade,
  workflow_step_id uuid not null references public.workflow_steps(id) on delete restrict,
  status text not null default 'running' check (status in ('running','completed','failed','skipped')),
  input_snapshot jsonb not null default '{}'::jsonb,
  output_payload jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.tool_plan_access (
  tool_id uuid not null references public.tools(id) on delete cascade,
  plan_id uuid not null references public.plans(id) on delete cascade,
  is_allowed boolean not null default true,
  daily_run_limit integer check (daily_run_limit is null or daily_run_limit > 0),
  max_output_tokens integer check (max_output_tokens is null or max_output_tokens > 0),
  created_at timestamptz not null default now(),
  primary key(tool_id, plan_id)
);

create table if not exists public.billing_providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  adapter_type text not null check (adapter_type in ('stripe_checkout')),
  secret_id uuid,
  webhook_secret_id uuid,
  config jsonb not null default '{}'::jsonb,
  priority integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.billing_plan_prices (
  id uuid primary key default gen_random_uuid(),
  billing_provider_id uuid not null references public.billing_providers(id) on delete cascade,
  plan_id uuid not null references public.plans(id) on delete cascade,
  external_price_id text not null,
  currency text not null default 'sar',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(billing_provider_id, plan_id)
);

alter table public.user_subscriptions
  add column if not exists billing_provider_id uuid references public.billing_providers(id) on delete set null,
  add column if not exists external_customer_id text,
  add column if not exists external_subscription_id text,
  add column if not exists current_period_start timestamptz,
  add column if not exists current_period_end timestamptz,
  add column if not exists cancel_at_period_end boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists idx_external_billing_subscription
  on public.user_subscriptions(billing_provider_id, external_subscription_id)
  where external_subscription_id is not null;

create table if not exists public.billing_events (
  id uuid primary key default gen_random_uuid(),
  billing_provider_id uuid not null references public.billing_providers(id) on delete cascade,
  external_event_id text not null,
  event_type text not null,
  status text not null default 'processing' check (status in ('processing','completed','failed')),
  payload jsonb not null default '{}'::jsonb,
  attempt_count integer not null default 1,
  processing_started_at timestamptz not null default now(),
  completed_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  unique(billing_provider_id, external_event_id)
);

create table if not exists public.subscription_credit_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.plans(id) on delete restrict,
  grant_key text not null unique,
  credits_granted bigint not null check (credits_granted >= 0),
  description text,
  created_at timestamptz not null default now()
);

alter table public.tool_runs
  add column if not exists workflow_id uuid references public.workflows(id) on delete set null;

create or replace function public.set_runtime_connection_secret(
  p_connection_id uuid,
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
  select secret_id into v_existing
  from public.runtime_connections
  where id = p_connection_id
  for update;

  if v_existing is null then
    select vault.create_secret(
      p_secret,
      'web_empire_runtime_connection_' || p_connection_id::text,
      'Web Empire runtime connection secret'
    ) into v_secret_id;

    update public.runtime_connections
    set secret_id = v_secret_id, updated_at = now()
    where id = p_connection_id;
  else
    perform vault.update_secret(v_existing, p_secret);
    v_secret_id := v_existing;
  end if;

  return v_secret_id;
end;
$$;

create or replace function public.get_runtime_connection_secret(
  p_connection_id uuid
)
returns text
language sql
security definer
set search_path = public, vault
as $$
  select ds.decrypted_secret
  from public.runtime_connections c
  join vault.decrypted_secrets ds on ds.id = c.secret_id
  where c.id = p_connection_id and c.is_active = true;
$$;

create or replace function public.set_billing_provider_secrets(
  p_provider_id uuid,
  p_api_secret text,
  p_webhook_secret text
)
returns void
language plpgsql
security definer
set search_path = public, vault
as $$
declare
  v_api_id uuid;
  v_webhook_id uuid;
  v_existing_api uuid;
  v_existing_webhook uuid;
begin
  select secret_id, webhook_secret_id
  into v_existing_api, v_existing_webhook
  from public.billing_providers
  where id = p_provider_id
  for update;

  if nullif(p_api_secret, '') is not null then
    if v_existing_api is null then
      select vault.create_secret(
        p_api_secret,
        'web_empire_billing_api_' || p_provider_id::text,
        'Web Empire billing provider API secret'
      ) into v_api_id;
    else
      perform vault.update_secret(v_existing_api, p_api_secret);
      v_api_id := v_existing_api;
    end if;
  else
    v_api_id := v_existing_api;
  end if;

  if nullif(p_webhook_secret, '') is not null then
    if v_existing_webhook is null then
      select vault.create_secret(
        p_webhook_secret,
        'web_empire_billing_webhook_' || p_provider_id::text,
        'Web Empire billing provider webhook secret'
      ) into v_webhook_id;
    else
      perform vault.update_secret(v_existing_webhook, p_webhook_secret);
      v_webhook_id := v_existing_webhook;
    end if;
  else
    v_webhook_id := v_existing_webhook;
  end if;

  update public.billing_providers
  set secret_id = v_api_id,
      webhook_secret_id = v_webhook_id,
      updated_at = now()
  where id = p_provider_id;
end;
$$;

create or replace function public.get_billing_provider_secrets(
  p_provider_id uuid
)
returns table(api_secret text, webhook_secret text)
language sql
security definer
set search_path = public, vault
as $$
  select api.decrypted_secret, webhook.decrypted_secret
  from public.billing_providers p
  left join vault.decrypted_secrets api on api.id = p.secret_id
  left join vault.decrypted_secrets webhook on webhook.id = p.webhook_secret_id
  where p.id = p_provider_id and p.is_active = true;
$$;

revoke all on function public.set_runtime_connection_secret(uuid, text) from public, anon, authenticated;
revoke all on function public.get_runtime_connection_secret(uuid) from public, anon, authenticated;
revoke all on function public.set_billing_provider_secrets(uuid, text, text) from public, anon, authenticated;
revoke all on function public.get_billing_provider_secrets(uuid) from public, anon, authenticated;
grant execute on function public.set_runtime_connection_secret(uuid, text) to service_role;
grant execute on function public.get_runtime_connection_secret(uuid) to service_role;
grant execute on function public.set_billing_provider_secrets(uuid, text, text) to service_role;
grant execute on function public.get_billing_provider_secrets(uuid) to service_role;

create or replace function public.claim_billing_event(
  p_provider_id uuid,
  p_external_event_id text,
  p_event_type text,
  p_payload jsonb
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into public.billing_events(
    billing_provider_id,
    external_event_id,
    event_type,
    status,
    payload,
    attempt_count,
    processing_started_at
  ) values (
    p_provider_id,
    p_external_event_id,
    p_event_type,
    'processing',
    p_payload,
    1,
    now()
  )
  on conflict (billing_provider_id, external_event_id) do nothing
  returning id into v_id;

  if v_id is not null then
    return true;
  end if;

  select id into v_id
  from public.billing_events
  where billing_provider_id = p_provider_id
    and external_event_id = p_external_event_id
    and status <> 'completed'
    and (
      status = 'failed'
      or processing_started_at < now() - interval '5 minutes'
    )
  for update;

  if v_id is null then
    return false;
  end if;

  update public.billing_events
  set status = 'processing',
      payload = p_payload,
      attempt_count = attempt_count + 1,
      processing_started_at = now(),
      error_message = null
  where id = v_id;

  return true;
end;
$$;

create or replace function public.activate_billing_subscription(
  p_user_id uuid,
  p_plan_id uuid,
  p_provider_id uuid,
  p_customer_id text,
  p_subscription_id text,
  p_status text,
  p_period_start timestamptz,
  p_period_end timestamptz,
  p_cancel_at_period_end boolean
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_subscription_id uuid;
begin
  update public.user_subscriptions
  set status = 'inactive', updated_at = now()
  where user_id = p_user_id
    and status = 'active'
    and external_subscription_id is distinct from p_subscription_id;

  select id into v_subscription_id
  from public.user_subscriptions
  where billing_provider_id = p_provider_id
    and external_subscription_id = p_subscription_id
  for update;

  if v_subscription_id is null then
    insert into public.user_subscriptions(
      user_id,
      plan_id,
      status,
      starts_at,
      expires_at,
      billing_provider_id,
      external_customer_id,
      external_subscription_id,
      current_period_start,
      current_period_end,
      cancel_at_period_end,
      updated_at
    ) values (
      p_user_id,
      p_plan_id,
      p_status,
      coalesce(p_period_start, now()),
      p_period_end,
      p_provider_id,
      p_customer_id,
      p_subscription_id,
      p_period_start,
      p_period_end,
      coalesce(p_cancel_at_period_end, false),
      now()
    ) returning id into v_subscription_id;
  else
    update public.user_subscriptions
    set user_id = p_user_id,
        plan_id = p_plan_id,
        status = p_status,
        external_customer_id = p_customer_id,
        current_period_start = p_period_start,
        current_period_end = p_period_end,
        expires_at = p_period_end,
        cancel_at_period_end = coalesce(p_cancel_at_period_end, false),
        updated_at = now()
    where id = v_subscription_id;
  end if;

  return v_subscription_id;
end;
$$;

create or replace function public.grant_subscription_credits(
  p_user_id uuid,
  p_plan_id uuid,
  p_grant_key text,
  p_description text
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_credits bigint;
  v_grant_id uuid;
  v_before bigint;
  v_after bigint;
begin
  select monthly_credits into v_credits
  from public.plans
  where id = p_plan_id and is_active = true;

  if v_credits is null then
    raise exception 'PLAN_NOT_FOUND';
  end if;

  insert into public.subscription_credit_grants(
    user_id,
    plan_id,
    grant_key,
    credits_granted,
    description
  ) values (
    p_user_id,
    p_plan_id,
    p_grant_key,
    v_credits,
    p_description
  )
  on conflict (grant_key) do nothing
  returning id into v_grant_id;

  if v_grant_id is null then
    return (
      select balance from public.credit_wallets where user_id = p_user_id
    );
  end if;

  select balance into v_before
  from public.credit_wallets
  where user_id = p_user_id
  for update;

  if v_before is null then
    insert into public.credit_wallets(user_id, balance)
    values (p_user_id, 0)
    on conflict do nothing;
    v_before := 0;
  end if;

  v_after := v_before + v_credits;

  update public.credit_wallets
  set balance = v_after, updated_at = now()
  where user_id = p_user_id;

  insert into public.credit_transactions(
    user_id,
    transaction_type,
    amount,
    balance_before,
    balance_after,
    description
  ) values (
    p_user_id,
    'grant',
    v_credits,
    v_before,
    v_after,
    p_description
  );

  return v_after;
end;
$$;

revoke all on function public.claim_billing_event(uuid, text, text, jsonb) from public, anon, authenticated;
revoke all on function public.activate_billing_subscription(uuid, uuid, uuid, text, text, text, timestamptz, timestamptz, boolean) from public, anon, authenticated;
revoke all on function public.grant_subscription_credits(uuid, uuid, text, text) from public, anon, authenticated;
grant execute on function public.claim_billing_event(uuid, text, text, jsonb) to service_role;
grant execute on function public.activate_billing_subscription(uuid, uuid, uuid, text, text, text, timestamptz, timestamptz, boolean) to service_role;
grant execute on function public.grant_subscription_credits(uuid, uuid, text, text) to service_role;

alter table public.runtime_connections enable row level security;
alter table public.workflows enable row level security;
alter table public.workflow_steps enable row level security;
alter table public.workflow_step_runs enable row level security;
alter table public.tool_plan_access enable row level security;
alter table public.billing_providers enable row level security;
alter table public.billing_plan_prices enable row level security;
alter table public.billing_events enable row level security;
alter table public.subscription_credit_grants enable row level security;

create policy "admins manage runtime connections" on public.runtime_connections for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage workflows" on public.workflows for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage workflow steps" on public.workflow_steps for all using (public.is_admin()) with check (public.is_admin());
create policy "admins read workflow step runs" on public.workflow_step_runs for select using (public.is_admin());
create policy "users read own workflow step runs" on public.workflow_step_runs for select using (
  exists (
    select 1 from public.tool_runs r
    where r.id = tool_run_id and r.user_id = auth.uid()
  )
);
create policy "admins manage tool plan access" on public.tool_plan_access for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage billing providers" on public.billing_providers for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage billing plan prices" on public.billing_plan_prices for all using (public.is_admin()) with check (public.is_admin());
create policy "admins read billing events" on public.billing_events for select using (public.is_admin());
create policy "admins read subscription grants" on public.subscription_credit_grants for select using (public.is_admin());
create policy "users read own subscription grants" on public.subscription_credit_grants for select using (user_id = auth.uid());

create index if not exists idx_workflow_steps_order on public.workflow_steps(workflow_id, sort_order);
create index if not exists idx_step_runs_tool_run on public.workflow_step_runs(tool_run_id, created_at);
create index if not exists idx_tool_plan_access_plan on public.tool_plan_access(plan_id, tool_id);
create index if not exists idx_billing_events_status on public.billing_events(status, processing_started_at);
create index if not exists idx_billing_price_plan on public.billing_plan_prices(plan_id, is_active);
create index if not exists idx_subscription_external_customer on public.user_subscriptions(billing_provider_id, external_customer_id);

create or replace function public.create_tool_from_builder(
  p_tool jsonb,
  p_translations jsonb,
  p_skill_ids jsonb,
  p_plan_access jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tool_id uuid;
  v_item jsonb;
begin
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
    seo_title,
    seo_description
  ) values (
    p_tool->>'slug',
    p_tool->>'title_ar',
    p_tool->>'title_en',
    p_tool->>'short_description',
    (p_tool->>'category_id')::uuid,
    (p_tool->>'engine_type')::public.tool_engine_type,
    coalesce(p_tool->'input_schema', '{"fields":[],"submitLabel":"Run"}'::jsonb),
    coalesce(p_tool->'output_schema', '{}'::jsonb),
    coalesce(p_tool->'runtime_config', '{}'::jsonb),
    (p_tool->>'provider_strategy')::public.provider_strategy_type,
    nullif(p_tool->>'model_alias', ''),
    nullif(p_tool->>'prompt_template', ''),
    (p_tool->>'pricing_mode')::public.pricing_mode_type,
    coalesce((p_tool->>'fixed_points')::integer, 0),
    coalesce((p_tool->>'minimum_points')::integer, 0),
    coalesce((p_tool->>'cost_multiplier')::numeric, 1),
    coalesce((p_tool->>'requires_auth')::boolean, false),
    coalesce((p_tool->>'is_featured')::boolean, false),
    coalesce((p_tool->>'is_active')::boolean, true),
    nullif(p_tool->>'seo_title', ''),
    nullif(p_tool->>'seo_description', '')
  ) returning id into v_tool_id;

  for v_item in select value from jsonb_array_elements(coalesce(p_translations, '[]'::jsonb))
  loop
    insert into public.tool_translations(
      tool_id,
      locale_id,
      title,
      short_description,
      seo_title,
      seo_description,
      prompt_template_override
    ) values (
      v_tool_id,
      (v_item->>'locale_id')::uuid,
      v_item->>'title',
      v_item->>'short_description',
      nullif(v_item->>'seo_title', ''),
      nullif(v_item->>'seo_description', ''),
      nullif(v_item->>'prompt_template_override', '')
    );
  end loop;

  for v_item in select value from jsonb_array_elements(coalesce(p_skill_ids, '[]'::jsonb))
  loop
    insert into public.tool_skills(tool_id, skill_id, sort_order)
    values (
      v_tool_id,
      trim(both '"' from v_item::text)::uuid,
      (
        select (count(*) + 1) * 10
        from public.tool_skills
        where tool_id = v_tool_id
      )
    );
  end loop;

  for v_item in select value from jsonb_array_elements(coalesce(p_plan_access, '[]'::jsonb))
  loop
    insert into public.tool_plan_access(
      tool_id,
      plan_id,
      is_allowed,
      daily_run_limit,
      max_output_tokens
    ) values (
      v_tool_id,
      (v_item->>'plan_id')::uuid,
      coalesce((v_item->>'is_allowed')::boolean, false),
      nullif(v_item->>'daily_run_limit', '')::integer,
      nullif(v_item->>'max_output_tokens', '')::integer
    );
  end loop;

  return v_tool_id;
end;
$$;

revoke all on function public.create_tool_from_builder(jsonb, jsonb, jsonb, jsonb)
  from public, anon, authenticated;
grant execute on function public.create_tool_from_builder(jsonb, jsonb, jsonb, jsonb)
  to service_role;
