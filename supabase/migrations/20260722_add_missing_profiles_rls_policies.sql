-- profiles has RLS enabled (relrowsecurity=true) but ZERO policies existed —
-- confirmed via pg_policies returning no rows for this table, while every
-- other user-scoped table (brands, calendar_events, images, etc.) correctly
-- has an "own rows" policy. With RLS on and no permissive policy, Postgres
-- default-denies everyone except service-role, so every direct client-side
-- supabase.from('profiles').select/update(...) call has always silently
-- returned zero rows for real users — masked because useProfile.ts falls
-- back to a client-only default object on read failure, and because nothing
-- checks the .error on write calls (welcome/page.tsx's finish(), billing's
-- cancel-subscription button, and Image Studio/tour code all write directly
-- from the client). Server-side API routes were unaffected since they use
-- the service-role key, which bypasses RLS entirely.
-- Restoring the two policies schema.sql already declares for this table.

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'own profile read') then
    create policy "own profile read" on profiles for select using (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'own profile update') then
    create policy "own profile update" on profiles for update using (auth.uid() = id);
  end if;
end $$;
