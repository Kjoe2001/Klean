-- image-studio/page.tsx and /api/image/route.ts are being revived (image
-- generation was previously built then disabled). images doesn't exist in
-- production yet — same pattern as every other missing table found this
-- session. Creating it per supabase/schema.sql. brand_id gets a real FK since,
-- unlike content/campaigns/payments/etc., brands does exist in production.

create table if not exists images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  brand_id uuid references brands(id) on delete set null,
  prompt text not null, mode text, size text, url text not null,
  created_at timestamptz default now()
);

alter table images enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'images' and policyname = 'own rows all') then
    create policy "own rows all" on images for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;
