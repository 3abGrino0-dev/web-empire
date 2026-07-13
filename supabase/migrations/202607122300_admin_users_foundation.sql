begin;

alter table public.profiles
  add column if not exists status text not null default 'active',
  add column if not exists suspension_reason text,
  add column if not exists suspended_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_status_check'
  ) then
    alter table public.profiles
      add constraint profiles_status_check
      check (status in ('active','suspended','blocked'));
  end if;
end $$;

alter table public.admin_users
  add column if not exists role text not null default 'owner',
  add column if not exists permissions jsonb not null default '{}'::jsonb,
  add column if not exists is_active boolean not null default true,
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'admin_users_role_check'
  ) then
    alter table public.admin_users
      add constraint admin_users_role_check
      check (role in (
        'owner','super_admin','admin',
        'support','content_manager','finance_manager'
      ));
  end if;
end $$;

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_audit_created
  on public.admin_audit_logs(created_at desc);

alter table public.admin_audit_logs enable row level security;

create or replace function public.admin_user_summary()
returns table (
  total_users bigint,
  active_users bigint,
  suspended_users bigint,
  blocked_users bigint,
  total_credits bigint,
  total_runs bigint
)
language sql
stable
security definer
set search_path = public, auth
as $$
  select
    count(u.id)::bigint,
    count(u.id) filter (where coalesce(p.status,'active')='active')::bigint,
    count(u.id) filter (where p.status='suspended')::bigint,
    count(u.id) filter (where p.status='blocked')::bigint,
    coalesce((select sum(balance) from public.credit_wallets),0)::bigint,
    coalesce((select count(*) from public.tool_runs),0)::bigint
  from auth.users u
  left join public.profiles p on p.id=u.id;
$$;

create or replace function public.admin_list_users(
  p_search text default null,
  p_status text default null,
  p_plan text default null,
  p_limit integer default 25,
  p_offset integer default 0
)
returns table (
  user_id uuid,
  email text,
  display_name text,
  profile_status text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  balance bigint,
  plan_slug text,
  plan_name_ar text,
  run_count bigint,
  credits_consumed bigint,
  total_count bigint
)
language sql
stable
security definer
set search_path = public, auth
as $$
  with rows as (
    select
      u.id user_id,
      u.email::text email,
      p.display_name,
      coalesce(p.status,'active') profile_status,
      u.created_at,
      u.last_sign_in_at,
      coalesce(w.balance,0)::bigint balance,
      ap.slug plan_slug,
      ap.name_ar plan_name_ar,
      coalesce(rs.run_count,0)::bigint run_count,
      coalesce(rs.credits_consumed,0)::bigint credits_consumed
    from auth.users u
    left join public.profiles p on p.id=u.id
    left join public.credit_wallets w on w.user_id=u.id
    left join lateral (
      select pl.slug, pl.name_ar
      from public.user_subscriptions s
      join public.plans pl on pl.id=s.plan_id
      where s.user_id=u.id and s.status='active'
      order by s.created_at desc
      limit 1
    ) ap on true
    left join lateral (
      select
        count(*)::bigint run_count,
        coalesce(sum(credits_charged),0)::bigint credits_consumed
      from public.tool_runs tr
      where tr.user_id=u.id
    ) rs on true
    where (
      nullif(btrim(coalesce(p_search,'')),'') is null
      or u.email ilike '%'||btrim(p_search)||'%'
      or coalesce(p.display_name,'') ilike '%'||btrim(p_search)||'%'
      or u.id::text ilike '%'||btrim(p_search)||'%'
    )
    and (
      nullif(btrim(coalesce(p_status,'')),'') is null
      or coalesce(p.status,'active')=p_status
    )
    and (
      nullif(btrim(coalesce(p_plan,'')),'') is null
      or ap.slug=p_plan
    )
  )
  select rows.*, count(*) over()::bigint
  from rows
  order by created_at desc
  limit greatest(1,least(coalesce(p_limit,25),100))
  offset greatest(coalesce(p_offset,0),0);
$$;

revoke all on function public.admin_user_summary() from public,anon,authenticated;
revoke all on function public.admin_list_users(text,text,text,integer,integer)
  from public,anon,authenticated;

grant execute on function public.admin_user_summary() to service_role;
grant execute on function public.admin_list_users(text,text,text,integer,integer)
  to service_role;

commit;
