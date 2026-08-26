import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { CREDIT_COST, planCredits, PlanKey } from '@/lib/plans';
import { isTrialExpired } from '@/lib/trial-guard';
import { parseBatch, sanitizeBrand, QUALITIES, ASPECTS, MAX_BATCH } from '@/lib/video-sources';

/* Video Download Studio job intake.
   POST { links, quality, aspect, brand, rightsAck } -> creates one job per valid
   link and charges credits for the whole batch up front. The worker refunds any
   job that fails to resolve, so a dead link never costs the user anything.
   GET -> the caller's recent jobs (the studio polls this). */

export const runtime = 'nodejs';

const UNLIMITED_BALANCE = 999999;
const FREE_PLANS: PlanKey[] = ['trial', 'weekly'];

function hasUnlimitedCredits(profile: any) {
  const isAdmin = profile?.role === 'admin' || profile?.is_admin === true;
  return profile?.unlimited_credits === true || isAdmin;
}

async function userFrom(req: NextRequest, db: any) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const { data } = await db.auth.getUser(token);
  return data?.user ?? null;
}

function clientIp(req: NextRequest) {
  const fwd = req.headers.get('x-forwarded-for');
  return fwd ? fwd.split(',')[0].trim() : null;
}

export async function GET(req: NextRequest) {
  const db = supabaseAdmin();
  const user = await userFrom(req, db);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data, error } = await db
    .from('download_jobs')
    .select('id,source_url,platform,status,progress,quality,aspect,title,duration_s,output_bytes,error_code,error_detail,credits_spent,refunded,created_at,expires_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(60);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ jobs: data ?? [] });
}

export async function POST(req: NextRequest) {
  const db = supabaseAdmin();
  const user = await userFrom(req, db);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({} as any));
  const { links, quality, aspect, brand, rightsAck } = body ?? {};

  // The rights confirmation is the record that shifts responsibility to the
  // account holder. No acknowledgement, no job — and we store when and from where.
  if (rightsAck !== true) {
    return NextResponse.json({ ok: false, error: 'rights_not_acknowledged' }, { status: 400 });
  }

  const { accepted, rejected } = parseBatch(
    Array.isArray(links) ? links.join('\n') : String(links ?? '')
  );

  if (!accepted.length) {
    return NextResponse.json(
      { ok: false, error: 'no_valid_links', rejected, limit: MAX_BATCH },
      { status: 400 },
    );
  }

  const q = QUALITIES.includes(quality) ? quality : '1080p';
  const a = ASPECTS.includes(aspect) ? aspect : '9:16';

  // ---- plan + credits -------------------------------------------------
  const { data: profile, error: profileErr } = await db
    .from('profiles').select('*').eq('id', user.id).single();
  if (profileErr || !profile) {
    return NextResponse.json({ ok: false, error: 'profile_missing' }, { status: 500 });
  }

  const plan = (profile.plan || 'trial') as PlanKey;
  const unlimited = hasUnlimitedCredits(profile);

  if (!unlimited && isTrialExpired(profile)) {
    return NextResponse.json({ ok: false, error: 'trial_expired' }, { status: 402 });
  }

  const unit = CREDIT_COST.download_video ?? 3;
  const cost = unit * accepted.length;

  let balanceAfter = UNLIMITED_BALANCE;
  if (!unlimited) {
    const balance = profile.credits ?? planCredits(plan);
    if (balance < cost) {
      return NextResponse.json(
        { ok: false, error: 'insufficient_credits', balance, needed: cost },
        { status: 402 },
      );
    }
    balanceAfter = balance - cost;
    await db.from('profiles').update({ credits: balanceAfter }).eq('id', user.id);
    await db.from('credit_log').insert({
      user_id: user.id,
      delta: -cost,
      balance_after: balanceAfter,
      reason: `Video download + branding × ${accepted.length}`,
    });
  }

  // Free and trial plans always carry the Zelvoo badge; paid plans may pass
  // their own logo. sanitizeBrand enforces that server-side so the client
  // cannot simply post zelvoo:false.
  const forceZelvoo = FREE_PLANS.includes(plan);
  const brandSpec = sanitizeBrand(brand, forceZelvoo);

  const rows = accepted.map((s) => ({
    user_id: user.id,
    workspace_id: body?.workspaceId ?? null,
    source_url: s.url,
    platform: s.platform,
    intake: 'link',
    rights_ack: true,
    rights_ack_at: new Date().toISOString(),
    rights_ack_ip: clientIp(req),
    quality: q,
    aspect: a,
    brand: brandSpec,
    status: 'queued',
    credits_spent: unlimited ? 0 : unit,
  }));

  const { data: jobs, error: insertErr } = await db
    .from('download_jobs').insert(rows).select();

  if (insertErr) {
    // Insert failed after the charge — hand the credits straight back.
    if (!unlimited) {
      const restored = balanceAfter + cost;
      await db.from('profiles').update({ credits: restored }).eq('id', user.id);
      await db.from('credit_log').insert({
        user_id: user.id, delta: cost, balance_after: restored,
        reason: 'Refund — download jobs could not be queued',
      });
    }
    return NextResponse.json({ ok: false, error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    jobs,
    rejected,
    spent: unlimited ? 0 : cost,
    balance: balanceAfter,
  });
}
