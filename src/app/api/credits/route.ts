import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CREDIT_COST, planCredits, PlanKey } from '@/lib/plans';

/* Server-authoritative credit ledger.
   GET  -> current balance (and tops up on new period)
   POST { action } -> attempts to spend credits; returns {ok, balance} or 402 if insufficient. */

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

export async function GET(req: NextRequest) {
  const db = admin();
  const user = await userFrom(req, db);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { data: p } = await db.from('profiles').select('plan, credits, credits_period_start, plan_started_at').eq('id', user.id).single();
  const plan = (p?.plan || 'trial') as PlanKey;
  return NextResponse.json({ plan, credits: p?.credits ?? planCredits(plan) });
}

export async function POST(req: NextRequest) {
  const db = admin();
  const user = await userFrom(req, db);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { action } = await req.json();
  const cost = CREDIT_COST[action] ?? 1;

  const { data: p } = await db.from('profiles').select('plan, credits').eq('id', user.id).single();
  const plan = (p?.plan || 'trial') as PlanKey;
  let bal = p?.credits;
  if (bal == null) bal = planCredits(plan); // initialise if never set

  if (bal < cost) {
    return NextResponse.json({ ok: false, error: 'insufficient_credits', balance: bal, needed: cost }, { status: 402 });
  }
  const next = bal - cost;
  await db.from('profiles').update({ credits: next }).eq('id', user.id);
  return NextResponse.json({ ok: true, balance: next, spent: cost });
}
