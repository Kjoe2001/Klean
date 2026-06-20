-- ============================================================
-- ZELVO V2 — full database schema (run in Supabase SQL Editor)
-- ============================================================

-- PROFILES (extends auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text, company text, industry text, country text, avatar_url text,
  plan text not null default 'trial',
  role text not null default 'user',          -- 'user' | 'admin'
  trial_started_at timestamptz default now(),
  created_at timestamptz default now()
);

create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- WORKSPACES + MEMBERS
create table if not exists workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null, owner_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now()
);
create table if not exists workspace_members (
  workspace_id uuid references workspaces(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  role text not null default 'viewer',        -- owner|admin|editor|viewer
  primary key (workspace_id, user_id)
);

-- BRANDS (Brand Kit)
create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  workspace_id uuid references workspaces(id) on delete set null,
  name text not null, industry text, audience text,
  logo_url text, colors jsonb default '[]', fonts text,
  tone text, taglines text, guidelines text,
  created_at timestamptz default now()
);

-- CLIENTS (agency portal)
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  name text not null, email text, brand_id uuid references brands(id) on delete set null,
  status text default 'active', created_at timestamptz default now()
);

-- CAMPAIGNS
create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  brand_id uuid references brands(id) on delete set null,
  client_id uuid references clients(id) on delete set null,
  name text not null, budget numeric, goals text, audience text,
  plan jsonb, status text default 'draft', created_at timestamptz default now()
);

-- CONTENT (Library)
create table if not exists content (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  brand_id uuid references brands(id) on delete set null,
  campaign_id uuid references campaigns(id) on delete set null,
  type text not null, title text, body jsonb not null,
  score jsonb, tags text[] default '{}', folder text default 'General',
  created_at timestamptz default now()
);

-- IMAGES
create table if not exists images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  brand_id uuid references brands(id) on delete set null,
  prompt text not null, mode text, size text, url text not null,
  created_at timestamptz default now()
);

-- CALENDAR
create table if not exists calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  content_id uuid references content(id) on delete set null,
  title text not null, platform text, scheduled_at timestamptz not null,
  status text default 'scheduled', created_at timestamptz default now()
);

-- BILLING
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  plan text not null, status text not null default 'active',   -- active|cancelled|past_due
  flw_tx_ref text, current_period_end timestamptz,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  amount numeric, currency text default 'USD', plan text,
  flw_tx_id text, flw_tx_ref text unique, status text,          -- successful|failed|pending
  method text, created_at timestamptz default now()
);
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid references payments(id) on delete cascade,
  raw jsonb, created_at timestamptz default now()
);
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  payment_id uuid references payments(id) on delete set null,
  number serial, amount numeric, currency text, plan text, issued_at timestamptz default now()
);

-- INTELLIGENCE
create table if not exists competitors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  name text not null, industry text, report jsonb, created_at timestamptz default now()
);
create table if not exists trends (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  scope text, industry text, report jsonb, created_at timestamptz default now()
);
create table if not exists analytics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  source text, metrics jsonb, period date, created_at timestamptz default now()
);
create table if not exists exports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  kind text, filename text, created_at timestamptz default now()
);
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text, body text, read boolean default false, created_at timestamptz default now()
);

-- ============ ROW LEVEL SECURITY ============
do $$ declare t text;
begin
  foreach t in array array['profiles','workspaces','workspace_members','brands','clients','campaigns',
    'content','images','calendar_events','subscriptions','payments','invoices','competitors','trends',
    'analytics','exports','notifications','transactions']
  loop execute format('alter table %I enable row level security', t); end loop;
end $$;

create policy "own profile read"   on profiles for select using (auth.uid() = id);
create policy "own profile update" on profiles for update using (auth.uid() = id);

do $$ declare t text;
begin
  foreach t in array array['brands','clients','campaigns','content','images','calendar_events',
    'subscriptions','payments','invoices','competitors','trends','analytics','exports','notifications']
  loop
    execute format('create policy "own rows all" on %I for all using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
  end loop;
end $$;

create policy "ws owner all" on workspaces for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "ws member read" on workspaces for select using (
  exists (select 1 from workspace_members m where m.workspace_id = id and m.user_id = auth.uid()));
create policy "wsm self read" on workspace_members for select using (user_id = auth.uid());
create policy "wsm owner manage" on workspace_members for all using (
  exists (select 1 from workspaces w where w.id = workspace_id and w.owner_id = auth.uid()));

-- ============ ADMIN METRICS (service role bypasses RLS; this RPC is a convenience) ============
create or replace function admin_stats() returns json
language sql security definer set search_path = public as $$
  select json_build_object(
    'total_users',   (select count(*) from profiles),
    'trial_users',   (select count(*) from profiles where plan = 'trial'),
    'paid_users',    (select count(*) from profiles where plan not in ('trial')),
    'active_subs',   (select count(*) from subscriptions where status = 'active'),
    'mrr',           (select coalesce(sum(case plan when 'starter' then 19 when 'pro' then 49 when 'studio' then 99 when 'agency' then 249 else 0 end),0) from subscriptions where status='active'),
    'revenue_total', (select coalesce(sum(amount),0) from payments where status = 'successful'),
    'signups_30d',   (select count(*) from profiles where created_at > now() - interval '30 days'),
    'by_plan',       (select coalesce(json_object_agg(plan, n),'{}'::json) from (select plan, count(*) n from profiles group by plan) s),
    'recent_payments',(select coalesce(json_agg(p),'[]'::json) from (select amount,currency,plan,status,method,created_at from payments order by created_at desc limit 10) p)
  );
$$;
revoke execute on function admin_stats() from anon, authenticated;

-- ============================================================
-- JOURNEY / GROWTH LAYER (V2.1)
-- ============================================================

-- Activation & onboarding flags on profiles
alter table if exists profiles add column if not exists onboarded boolean default false;
alter table if exists profiles add column if not exists activation jsonb default '{}'::jsonb;
alter table if exists profiles add column if not exists role_type text;
alter table if exists profiles add column if not exists goal text;

-- Saved prompts
create table if not exists prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  title text not null, body text not null, tag text, favorite boolean default false,
  created_at timestamptz default now()
);

-- Template usage tracking
create table if not exists template_uses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  template_id text not null, created_at timestamptz default now()
);

-- Approvals
create table if not exists approvals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid, content_id uuid references content on delete cascade,
  client_id uuid, requested_by uuid references auth.users,
  status text default 'pending', note text, score int,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

-- Integrations (per workspace connected services + tokens)
create table if not exists integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  provider text not null, status text default 'connected',
  access_token text, refresh_token text, meta jsonb,
  created_at timestamptz default now()
);

-- Coupons
create table if not exists coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null, percent_off int, months int default 1,
  plan text, max_redemptions int, redeemed int default 0,
  active boolean default true, expires_at timestamptz, created_at timestamptz default now()
);

-- Affiliate / partner
create table if not exists affiliates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  ref_code text unique not null, clicks int default 0, signups int default 0,
  paid_referrals int default 0, earned_cents bigint default 0,
  payout_method text, created_at timestamptz default now()
);
create table if not exists referrals (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid references affiliates on delete cascade,
  referred_user uuid references auth.users, status text default 'signup',
  commission_cents bigint default 0, created_at timestamptz default now()
);
create table if not exists partner_deals (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references auth.users on delete cascade,
  account_name text, deal_type text, value_cents bigint, status text default 'registered',
  created_at timestamptz default now()
);

-- Support tickets
create table if not exists tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  subject text, body text, status text default 'open', priority text default 'normal',
  created_at timestamptz default now()
);

-- Academy progress
create table if not exists lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  lesson_id text not null, completed boolean default false,
  created_at timestamptz default now(), unique(user_id, lesson_id)
);

-- Notifications (already referenced; ensure table exists)
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  icon text, title text, body text, link text, color text default 'primary',
  read boolean default false, created_at timestamptz default now()
);

-- Enable RLS + owner policies on the new user-scoped tables
do $$
declare t text;
begin
  foreach t in array array['prompts','template_uses','integrations','affiliates','partner_deals','tickets','lesson_progress','notifications']
  loop
    execute format('alter table %I enable row level security', t);
    execute format($f$create policy if not exists "own_%1$s" on %1$I for all using (auth.uid() = user_id) with check (auth.uid() = user_id)$f$, t);
  end loop;
end $$;

-- Coupons readable by all authenticated users (for checkout validation), writable by service role only
alter table coupons enable row level security;
create policy if not exists "coupons_read" on coupons for select using (auth.role() = 'authenticated');

-- ============================================================
-- CREDITS, PLAN PERIODS, ONBOARDING DATA (V2.2)
-- ============================================================
alter table if exists profiles add column if not exists credits int default 30;
alter table if exists profiles add column if not exists credits_period_start timestamptz default now();
alter table if exists profiles add column if not exists plan_started_at timestamptz default now();
alter table if exists profiles add column if not exists use_case text;
alter table if exists profiles add column if not exists phone text;

-- New signups start on trial with 30 credits (handled by the signup trigger / default).
-- When a plan is purchased, the Flutterwave webhook should set:
--   credits = <plan credits>, credits_period_start = now(), plan_started_at = now()

-- Credit ledger (optional audit trail of spends/top-ups)
create table if not exists credit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  delta int not null, reason text, balance_after int,
  created_at timestamptz default now()
);
alter table credit_log enable row level security;
create policy if not exists "own_credit_log" on credit_log for select using (auth.uid() = user_id);
