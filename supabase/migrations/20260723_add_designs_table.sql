-- Creative Studio (replacing the old AI Image Studio) needs somewhere to
-- persist saved designs. Same pattern as the images table migration: create
-- if missing, RLS scoped to the owning user.

create table if not exists designs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  brand_id uuid references brands(id) on delete set null,
  name text not null default 'Untitled design',
  width int not null,
  height int not null,
  data jsonb not null,
  thumbnail text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table designs enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'designs' and policyname = 'own rows all') then
    create policy "own rows all" on designs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;
