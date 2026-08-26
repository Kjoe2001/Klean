# Zelvoo Download Worker

Turns a queued `download_jobs` row into a branded file in Supabase Storage.

```
studio (iframe)  →  /api/downloads  →  download_jobs  →  worker  →  storage
   paste links       charge credits      queued           this        signed
                                                          service     URL back
```

The worker is deliberately **not** part of the Next.js app. Vercel functions
have no ffmpeg and a short execution ceiling; this runs as a long-lived process
on Railway, Fly, Render or any box with Node 20 and ffmpeg.

---

## The one piece that is not implemented

`src/resolver.ts` defines the boundary between "we have a URL" and "we have a
file". Everything on the far side of it — branding, encoding, storage, credits,
refunds — is finished and works. The resolver itself ships as `NullResolver`,
which fails every job with `error_code=resolver` and refunds the credit.

**You supply the implementation.** Two shapes fit the interface:

| Option | What you take on |
|---|---|
| A local extraction binary you run yourself | Datacentre IPs get blocked fast; delivery formats change without notice. This is an ongoing maintenance commitment, not a one-time integration. |
| A third-party extraction API | You rent the problem. Their terms sit between you and the platform, and they absorb the operational churn. Costs scale per call. |

Read the header comment in `src/resolver.ts` before choosing. Two things worth
being clear-eyed about:

- Fetching media from YouTube, Meta, TikTok and LinkedIn is against those
  platforms' terms of service, regardless of which option you pick.
- Whatever the resolver returns gets **Zelvoo's logo burned into it** and handed
  to a user. If the source was not theirs to reuse, your mark is the one on the
  reposted file. The rights acknowledgement captured at intake
  (`download_jobs.rights_ack`, with timestamp and IP) is the record you would
  point to.

Implement `resolve()`, register it in `getResolver()`, set `RESOLVER=local` or
`RESOLVER=api`, and the rest of the pipeline starts working immediately.

### Contract

```ts
resolve(req: ResolveRequest): Promise<ResolveResult>
```

Map failures onto `ResolveErrorCode` so the studio can explain them:

| Code | Shown to the user |
|---|---|
| `unavailable` | private, deleted or age-restricted — credit refunded |
| `unsupported` | post type not handled — credit refunded |
| `too_long`    | over `MAX_DURATION_S` — credit refunded |
| `blocked`     | platform refused the request |
| `resolver`    | anything else |

Every one of these refunds automatically. A user is never charged for a link
that did not produce a file.

---

## Running it

```bash
cp .env.example .env      # fill in SUPABASE_SERVICE_ROLE_KEY
npm install
npm start
```

Requires `ffmpeg` and `ffprobe` on PATH.

| Variable | Purpose |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Claims jobs and writes to the `downloads` bucket. Never expose this client-side. |
| `RESOLVER` | `none` (default), `local`, or `api` |
| `MAX_CONCURRENCY` | Simultaneous jobs. ffmpeg is CPU-bound — start at 2 and watch load. |
| `MAX_DURATION_S` | Hard ceiling per clip. Default 20 minutes. |
| `WORK_DIR` | Scratch space. Each job gets a subdirectory, removed afterwards. |

Scale by running more instances. Claiming uses a conditional update, so two
workers racing the same row is safe — one wins, the other moves on. Jobs whose
worker died are requeued after 20 minutes, up to 3 attempts.

## Deploying

1. Apply `supabase/migrations/20260825_add_download_jobs_table.sql`.
2. Deploy the Next.js app as usual — the studio and API ship with it.
3. Deploy this directory separately with ffmpeg available. On Railway or Render,
   an ffmpeg buildpack or an `apt` step in the Dockerfile covers it.
4. Add a scheduled job to clear expired files:
   ```sql
   delete from storage.objects
    where bucket_id = 'downloads'
      and created_at < now() - interval '7 days';
   update download_jobs set status = 'expired', output_path = null
    where status = 'ready' and expires_at < now();
   ```

If this directory sits inside the Next.js repo, add `worker` to `.vercelignore`
so Vercel does not try to install its dependencies.
