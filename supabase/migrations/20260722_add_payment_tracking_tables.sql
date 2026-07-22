-- The Flutterwave webhook/verify routes have always written to subscriptions,
-- payments, transactions and invoices, but these tables were never migrated to
-- production (unlike profiles/credit_log/brands, which do exist). Plan/credit
-- activation still worked (writes to profiles + credit_log), but no payment
-- record was ever saved, so billing/page.tsx has been silently showing
-- "No payments yet" for every real, successful charge. This creates the
-- missing tables to match supabase/schema.sql.

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade unique,
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

alter table subscriptions enable row level security;
alter table payments enable row level security;
alter table transactions enable row level security;
alter table invoices enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'subscriptions' and policyname = 'own rows all') then
    create policy "own rows all" on subscriptions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'payments' and policyname = 'own rows all') then
    create policy "own rows all" on payments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'invoices' and policyname = 'own rows all') then
    create policy "own rows all" on invoices for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

-- transactions intentionally has no policy: raw webhook payloads, service-role only.
