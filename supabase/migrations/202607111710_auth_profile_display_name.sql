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
  insert into public.profiles(id, display_name)
  values (
    new.id,
    nullif(btrim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '')
  )
  on conflict (id) do update
  set display_name = coalesce(
    public.profiles.display_name,
    excluded.display_name
  );

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

update public.profiles p
set display_name =
  nullif(btrim(coalesce(u.raw_user_meta_data ->> 'full_name', '')), '')
from auth.users u
where p.id = u.id
  and (p.display_name is null or btrim(p.display_name) = '')
  and nullif(
    btrim(coalesce(u.raw_user_meta_data ->> 'full_name', '')),
    ''
  ) is not null;
