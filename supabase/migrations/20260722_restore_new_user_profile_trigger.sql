-- The trigger that auto-creates a profiles row for every new auth.users signup
-- doesn't exist in production (confirmed: `select * from pg_trigger where tgname =
-- 'on_auth_user_created'` returned zero rows). Signup passes ?plan= straight through
-- to /checkout, so a brand-new user could pay before any profile row exists, and
-- profiles.update().eq('id', userId) in the Flutterwave verify/webhook routes would
-- silently match zero rows — the customer pays but never gets their plan/credits.
-- Restoring this from supabase/schema.sql.

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
