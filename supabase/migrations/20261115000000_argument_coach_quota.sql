create table public.argument_coach_quota (
  singleton boolean primary key default true check (singleton),
  minute_start timestamptz not null,
  minute_count integer not null default 0,
  day_start timestamptz not null,
  day_count integer not null default 0
);

alter table public.argument_coach_quota enable row level security;
revoke all on public.argument_coach_quota from public, anon, authenticated;
grant select, insert, update on public.argument_coach_quota to service_role;

create function public.reserve_argument_coach_quota()
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  minute_window timestamptz := date_trunc('minute', statement_timestamp(), 'UTC');
  day_window timestamptz := date_trunc('day', statement_timestamp(), 'UTC');
begin
  insert into public.argument_coach_quota as quota
    (singleton, minute_start, minute_count, day_start, day_count)
    values (true, minute_window, 1, day_window, 1)
  on conflict (singleton) do update
    set minute_count = case when quota.minute_start < minute_window then 1 else quota.minute_count + 1 end,
        minute_start = greatest(quota.minute_start, minute_window),
        day_count = case when quota.day_start < day_window then 1 else quota.day_count + 1 end,
        day_start = greatest(quota.day_start, day_window)
    where (quota.minute_start < minute_window or quota.minute_count < 12)
      and (quota.day_start < day_window or quota.day_count < 100);

  return found;
end;
$$;

revoke all on function public.reserve_argument_coach_quota() from public, anon, authenticated;
grant execute on function public.reserve_argument_coach_quota() to service_role;
