/* Zelvoo download worker.
   Claims queued jobs, hands the URL to the configured resolver, composites the
   brand mark, uploads the result, and refunds the credit on any failure. */

import { createClient } from '@supabase/supabase-js';
import { mkdir, rm, stat, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { getResolver, ResolveError, type ResolveErrorCode } from './resolver.js';
import { brandVideo, probe, type Aspect, type Quality } from './brand.js';
import type { BrandSpec } from './badge.js';

const {
  NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
  WORKER_ID = `worker-${randomUUID().slice(0, 8)}`,
  POLL_INTERVAL_MS = '3000',
  MAX_CONCURRENCY = '2',
  MAX_DURATION_S = '1200',
  WORK_DIR = '/tmp/zelvoo',
} = process.env;

if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const db = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const resolver = getResolver();
const pollMs = Number(POLL_INTERVAL_MS);
const concurrency = Number(MAX_CONCURRENCY);
const maxDurationS = Number(MAX_DURATION_S);

let inFlight = 0;
let shuttingDown = false;
const controllers = new Set<AbortController>();

/* ------------------------------------------------------------------ helpers */

async function setStatus(id: string, patch: Record<string, unknown>) {
  await db.from('download_jobs').update(patch).eq('id', id);
}

/** Hand the credit back exactly once. */
async function refund(job: any, reason: string) {
  if (!job.credits_spent || job.refunded) return;
  const { data: profile } = await db
    .from('profiles').select('credits').eq('id', job.user_id).single();
  const restored = (profile?.credits ?? 0) + job.credits_spent;

  await db.from('profiles').update({ credits: restored }).eq('id', job.user_id);
  await db.from('credit_log').insert({
    user_id: job.user_id, delta: job.credits_spent, balance_after: restored,
    reason: `Refund — ${reason}`,
  });
  await db.from('download_jobs').update({ refunded: true }).eq('id', job.id);
}

/** Claim one queued job. The conditional update is the lock: two workers
 *  racing the same row means one of them updates zero rows and moves on. */
async function claim(): Promise<any | null> {
  const { data: candidates } = await db
    .from('download_jobs')
    .select('*')
    .eq('status', 'queued')
    .order('created_at', { ascending: true })
    .limit(5);

  for (const job of candidates ?? []) {
    const { data: locked } = await db
      .from('download_jobs')
      .update({
        status: 'resolving', locked_by: WORKER_ID,
        locked_at: new Date().toISOString(), attempts: (job.attempts ?? 0) + 1,
      })
      .eq('id', job.id)
      .eq('status', 'queued')
      .select()
      .maybeSingle();

    if (locked) return locked;
  }
  return null;
}

/* --------------------------------------------------------------- processing */

async function runJob(job: any) {
  const dir = join(WORK_DIR, job.id);
  const controller = new AbortController();
  controllers.add(controller);

  try {
    await mkdir(dir, { recursive: true });

    // ---- resolve -----------------------------------------------------
    const resolved = await resolver.resolve({
      url: job.source_url,
      platform: job.platform,
      quality: job.quality as Quality,
      maxDurationS,
      workDir: dir,
      signal: controller.signal,
    });

    if (resolved.durationS && resolved.durationS > maxDurationS) {
      throw new ResolveError('too_long', `Clip is ${Math.round(resolved.durationS)}s.`);
    }

    // ---- brand -------------------------------------------------------
    await setStatus(job.id, {
      status: 'branding', progress: 10,
      title: resolved.title ?? null,
      duration_s: resolved.durationS ?? null,
    });

    const meta = resolved.width && resolved.height
      ? { width: resolved.width, height: resolved.height, duration: resolved.durationS ?? 0 }
      : await probe(resolved.filePath);

    const isAudio = job.quality === 'audio';
    const outName = `output.${isAudio ? 'mp3' : 'mp4'}`;
    const outPath = join(dir, outName);

    await brandVideo({
      inputPath: resolved.filePath,
      outputPath: outPath,
      workDir: dir,
      spec: job.brand as BrandSpec,
      aspect: job.aspect as Aspect,
      quality: job.quality as Quality,
      srcWidth: meta.width || 1080,
      srcHeight: meta.height || 1920,
      durationS: meta.duration || resolved.durationS,
      signal: controller.signal,
      onProgress: (pct) => {
        void setStatus(job.id, { progress: Math.max(10, Math.min(95, 10 + pct * 0.85)) });
      },
    });

    // ---- store -------------------------------------------------------
    const bytes = (await stat(outPath)).size;
    const objectPath = `${job.user_id}/${job.id}/${outName}`;

    const { error: uploadErr } = await db.storage
      .from('downloads')
      .upload(objectPath, await readFile(outPath), {
        contentType: isAudio ? 'audio/mpeg' : 'video/mp4',
        upsert: true,
      });

    if (uploadErr) throw new Error(`upload failed: ${uploadErr.message}`);

    await setStatus(job.id, {
      status: 'ready', progress: 100,
      output_path: objectPath, output_bytes: bytes,
      duration_s: resolved.durationS ?? meta.duration ?? null,
      title: resolved.title ?? job.title ?? null,
      error_code: null, error_detail: null,
    });

    console.log(`[${WORKER_ID}] ready ${job.id} (${(bytes / 1048576).toFixed(1)} MB)`);
  } catch (err: any) {
    const cancelled = err?.message === 'cancelled';
    const code: ResolveErrorCode = err instanceof ResolveError ? err.code : 'resolver';

    if (!cancelled) {
      await setStatus(job.id, {
        status: 'failed', progress: 0,
        error_code: code,
        error_detail: String(err?.message ?? err).slice(0, 500),
      });
      await refund(job, 'download could not be completed');
      console.warn(`[${WORKER_ID}] failed ${job.id}: ${code} — ${err?.message}`);
    }
  } finally {
    controllers.delete(controller);
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

/* --------------------------------------------------------------- main loop */

async function tick() {
  if (shuttingDown || inFlight >= concurrency) return;
  const job = await claim();
  if (!job) return;

  inFlight++;
  runJob(job).finally(() => { inFlight--; });
}

/** Jobs whose worker died mid-flight get returned to the queue. */
async function requeueStale() {
  const cutoff = new Date(Date.now() - 20 * 60 * 1000).toISOString();
  await db.from('download_jobs')
    .update({ status: 'queued', locked_by: null, locked_at: null })
    .in('status', ['resolving', 'branding'])
    .lt('locked_at', cutoff)
    .lt('attempts', 3);
}

async function main() {
  await mkdir(WORK_DIR, { recursive: true });
  console.log(`[${WORKER_ID}] up — resolver="${resolver.name}", concurrency=${concurrency}`);
  if (resolver.name === 'none') {
    console.warn(`[${WORKER_ID}] no resolver configured: every job will fail and refund.`);
  }

  setInterval(() => { void requeueStale(); }, 5 * 60 * 1000);

  for (;;) {
    if (shuttingDown && inFlight === 0) break;
    await tick().catch((e) => console.error(`[${WORKER_ID}] tick error`, e));
    await new Promise((r) => setTimeout(r, pollMs));
  }
  console.log(`[${WORKER_ID}] stopped`);
}

for (const sig of ['SIGINT', 'SIGTERM'] as const) {
  process.on(sig, () => {
    console.log(`[${WORKER_ID}] ${sig} — finishing ${inFlight} job(s)`);
    shuttingDown = true;
    controllers.forEach((c) => c.abort());
  });
}

main().catch((e) => { console.error(e); process.exit(1); });
