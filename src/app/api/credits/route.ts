import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CREDIT_COST, planCredits, PlanKey } from '@/lib/plans';
import { isTrialExpired } from '@/lib/trial-guard';

/* Server-authoritative credit ledger.
   GET  -> current balance (and tops up on new period)
   GET ?history=1 -> recent credit_log entries for this user
   POST { action, label? } -> attempts to spend credits; returns {ok, balance} or 402 if insufficient.
   Every successful spend is recorded in credit_log so the user can see what
   their credits were used for. */

const LABEL: Record<string, string> = {
  text: 'Content generation', image: 'AI image', campaign: 'Campaign build',
  score: 'AI scoring', intel: 'Trend / competitor intel', design: 'Creative Studio design saved',
  frame_video: 'Video Frame Studio video saved',
  download_video: 'Video download + branding',
};

const UNLIMITED_BALANCE = 999999;

function hasUnlimitedCredits(profile: any) {
  const isAdmin = profile?.role === 'admin' || profile?.is_admin === true;
  return profile?.unlimited_credits === true || isAdmin;
}

function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}
async function userFrom(req: NextRequest, db: any) {
  const auth = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!auth) return null;
  const { data } = await db.auth.getUser(auth);
  return data?.user ?? null;
}

async function ensureProfile(db: any, user: any) {
  const { data: existing, error: existingError } = await db.from('profiles').select('*').eq('id', user.id).single();
  if (!existingError && existing) return existing;

  await db.from('profiles').upsert({
    id: user.id,
    email: user.email ?? null,
    plan: 'trial',
    credits: planCredits('trial'),
  });

  const { data: created, error: createdError } = await db.from('profiles').select('*').eq('id', user.id).single();
  if (createdError || !created) {
    throw new Error(`Could not initialize profile: ${createdError?.message || 'unknown error'}`);
  }
  return created;
}

export async function GET(req: NextRequest) {
  const db = admin();
  const user = await userFrom(req, db);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  if (req.nextUrl.searchParams.get('history')) {
    const { data } = await db.from('credit_log').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(50);
    return NextResponse.json({ history: data || [] });
  }

  const p = await ensureProfile(db, user);
  const plan = (p?.plan || 'trial') as PlanKey;
  if (hasUnlimitedCredits(p)) {
    return NextResponse.json({ plan: 'enterprise', credits: UNLIMITED_BALANCE, unlimited: true });
  }
  return NextResponse.json({ plan, credits: p?.credits ?? planCredits(plan) });
}

export async function POST(req: NextRequest) {
  const db = admin();
  const user = await userFrom(req, db);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { action, label } = await req.json();
  const cost = CREDIT_COST[action] ?? 1;

  const p = await ensureProfile(db, user);
  if (hasUnlimitedCredits(p)) {
    return NextResponse.json({ ok: true, balance: UNLIMITED_BALANCE, spent: 0, unlimited: true });
  }
  const plan = (p?.plan || 'trial') as PlanKey;
  let bal = p?.credits;
  if (bal == null) bal = planCredits(plan); // initialise if never set

  if (isTrialExpired(p)) {
    return NextResponse.json({ ok: false, error: 'trial_expired', balance: bal, needed: cost }, { status: 402 });
  }

  if (bal < cost) {
    return NextResponse.json({ ok: false, error: 'insufficient_credits', balance: bal, needed: cost }, { status: 402 });
  }
  const next = bal - cost;
  await db.from('profiles').update({ credits: next }).eq('id', user.id);
  await db.from('credit_log').insert({
    user_id: user.id, delta: -cost, balance_after: next,
    reason: label || LABEL[action] || action,
  });
  return NextResponse.json({ ok: true, balance: next, spent: cost });
}
