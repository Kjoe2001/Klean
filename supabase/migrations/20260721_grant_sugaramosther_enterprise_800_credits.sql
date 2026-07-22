-- Grant sugaramosther@gmail.com full feature access with tracked credit usage.
-- We set enterprise plan + 800 credits, but keep unlimited_credits = false
-- so each usage continues to deduct and write to credit_log.

alter table if exists profiles add column if not exists plan text default 'trial';
alter table if exists profiles add column if not exists credits int default 30;
alter table if exists profiles add column if not exists unlimited_credits boolean default false;
alter table if exists profiles add column if not exists role text default 'user';
alter table if exists profiles add column if not exists trial_started_at timestamptz default now();
alter table if exists profiles add column if not exists plan_started_at timestamptz default now();
alter table if exists profiles add column if not exists credits_period_start timestamptz default now();

create table if not exists credit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  delta int not null,
  reason text,
  balance_after int,
  created_at timestamptz default now()
);

update profiles
set
  plan = 'enterprise',
  credits = 800,
  unlimited_credits = false,
  role = coalesce(role, 'user'),
  plan_started_at = now(),
  credits_period_start = now(),
  trial_started_at = coalesce(trial_started_at, now())
where lower(email) = 'sugaramosther@gmail.com';

insert into credit_log (user_id, delta, balance_after, reason)
select
  p.id,
  800,
  800,
  'Admin grant: enterprise access + 800 starting credits'
from profiles p
where lower(p.email) = 'sugaramosther@gmail.com'
  and not exists (
    select 1
    from credit_log cl
    where cl.user_id = p.id
      and cl.delta = 800
      and cl.balance_after = 800
      and cl.reason = 'Admin grant: enterprise access + 800 starting credits'
  );
