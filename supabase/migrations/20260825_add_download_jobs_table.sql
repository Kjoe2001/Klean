-- Video Download Studio: job queue for link-sourced clips.
-- A job is created by the app (credits already charged), claimed by the
-- worker, and moves: queued -> resolving -> branding -> ready | failed.

create table if not exists public.download_jobs (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  workspace_id   uuid,

  -- intake
  source_url     text not null,
  platform       text not null check (platform in ('tiktok','instagram','youtube','facebook','linkedin','upload')),
  intake         text not null default 'link' check (intake in ('link','upload','account')),
  rights_ack     boolean not null default false,
  rights_ack_at  timestamptz,
  rights_ack_ip  inet,

  -- requested output
  quality        text not null default '1080p' check (quality in ('1080p','720p','480p','audio')),
  aspect         text not null default '9:16'  check (aspect in ('9:16','1:1','4:5','16:9','source')),
  brand          jsonb not null default '{}'::jsonb,   -- mark style/pos/size/opacity/drift/logo_url

  -- lifecycle
  status         text not null default 'queued'
                 check (status in ('queued','resolving','branding','ready','failed','cancelled','expired')),
  progress       int  not null default 0 check (progress between 0 and 100),
  error_code     text,
  error_detail   text,

  -- results
  title          text,
  duration_s     numeric,
  output_path    text,          -- Supabase Storage object path
  output_bytes   bigint,

  -- accounting
  credits_spent  int  not null default 0,
  refunded       boolean not null default false,

  -- worker coordination
  attempts       int  not null default 0,
  locked_by      text,
  locked_at      timestamptz,

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  expires_at     timestamptz not null default now() + interval '7 days'
);

create index if not exists download_jobs_user_created_idx
  on public.download_jobs (user_id, created_at desc);

-- Partial index the worker polls; keeps the claim query cheap as the table grows.
create index if not exists download_jobs_claimable_idx
  on public.download_jobs (created_at)
  where status = 'queued';

create index if not exists download_jobs_expiry_idx
  on public.download_jobs (expires_at)
  where status = 'ready';

-- keep updated_at honest
create or replace function public.touch_download_jobs()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists download_jobs_touch on public.download_jobs;
create trigger download_jobs_touch
  before update on public.download_jobs
  for each row execute function public.touch_download_jobs();

-- ---------------------------------------------------------------- RLS
alter table public.download_jobs enable row level security;

-- Users see and cancel only their own jobs. They never insert directly:
-- creation goes through /api/downloads so credits are charged server-side.
drop policy if exists download_jobs_select_own on public.download_jobs;
create policy download_jobs_select_own on public.download_jobs
  for select using (auth.uid() = user_id);

drop policy if exists download_jobs_cancel_own on public.download_jobs;
create policy download_jobs_cancel_own on public.download_jobs
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id and status in ('cancelled'));

-- No insert/delete policy for authenticated users by design.
-- The service role bypasses RLS for the API route and the worker.

-- ------------------------------------------------------- storage bucket
insert into storage.buckets (id, name, public, file_size_limit)
values ('downloads', 'downloads', false, 524288000)   -- 500 MB
on conflict (id) do nothing;

-- Owner-only read of finished files; the worker writes with the service role.
drop policy if exists downloads_read_own on storage.objects;
create policy downloads_read_own on storage.objects
  for select using (
    bucket_id = 'downloads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
