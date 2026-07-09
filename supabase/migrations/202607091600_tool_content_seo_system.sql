create table if not exists public.tool_content_translations (
  tool_id uuid not null references public.tools(id) on delete cascade,
  locale_id uuid not null references public.locales(id) on delete cascade,
  primary_keyword text,
  secondary_keywords text[] not null default '{}'::text[],
  what_is text not null default '',
  use_cases jsonb not null default '[]'::jsonb,
  how_to_steps jsonb not null default '[]'::jsonb,
  methodology text not null default '',
  example_title text not null default '',
  example_content text not null default '',
  faq jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (tool_id, locale_id),
  constraint tool_content_use_cases_array check (jsonb_typeof(use_cases) = 'array'),
  constraint tool_content_how_to_steps_array check (jsonb_typeof(how_to_steps) = 'array'),
  constraint tool_content_faq_array check (jsonb_typeof(faq) = 'array')
);

create table if not exists public.tool_related_tools (
  tool_id uuid not null references public.tools(id) on delete cascade,
  related_tool_id uuid not null references public.tools(id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (tool_id, related_tool_id),
  constraint tool_related_not_self check (tool_id <> related_tool_id)
);

create index if not exists idx_tool_related_tools_order
  on public.tool_related_tools(tool_id, sort_order);

alter table public.tool_content_translations enable row level security;
alter table public.tool_related_tools enable row level security;

create policy "public read tool content translations"
  on public.tool_content_translations
  for select
  using (true);

create policy "public read tool related tools"
  on public.tool_related_tools
  for select
  using (true);

create policy "admins manage tool content translations"
  on public.tool_content_translations
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "admins manage tool related tools"
  on public.tool_related_tools
  for all
  using (public.is_admin())
  with check (public.is_admin());
