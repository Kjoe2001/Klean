-- calendar/page.tsx has always queried calendar_events, but it doesn't exist in
-- production (same root cause as the other missing tables found this session:
-- confirmed via a direct REST call -> PGRST205 "Could not find the table
-- 'public.calendar_events' in the schema cache"). Creating it so the calendar
-- actually works. content_id is a plain uuid with no FK — the `content` table
-- doesn't exist in production either (see earlier migrations this session).

create table if not exists calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  content_id uuid,
  title text not null, platform text, scheduled_at timestamptz not null,
  status text default 'scheduled', created_at timestamptz default now()
);

alter table calendar_events enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'calendar_events' and policyname = 'own rows all') then
    create policy "own rows all" on calendar_events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;
