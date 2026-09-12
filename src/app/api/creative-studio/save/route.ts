import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { CREDIT_COST, planCredits, PlanKey } from '@/lib/plans';
import { isTrialExpired } from '@/lib/trial-guard';

/* Creative Studio design save. POST { design: { id?, name, width, height, brandId, data } }
   Charges CREDIT_COST.design per save (create or update — the client shows the same
   flat cost for both) and upserts into `designs`. A failed insert/update refunds. */

export const runtime = 'nodejs';

const UNLIMITED_BALANCE = 999999;

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

export async function POST(req: NextRequest) {
  const db = supabaseAdmin();
  const user = await userFrom(req, db);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({} as any));
  const design = body?.design;
  if (!design || !design.data || !design.width || !design.height) {
    return NextResponse.json({ error: 'invalid_design' }, { status: 400 });
  }

  const { data: profile, error: profileErr } = await db
    .from('profiles').select('*').eq('id', user.id).single();
  if (profileErr || !profile) {
    return NextResponse.json({ error: 'profile_missing' }, { status: 500 });
  }

  const plan = (profile.plan || 'trial') as PlanKey;
  const unlimited = hasUnlimitedCredits(profile);

  if (!unlimited && isTrialExpired(profile)) {
    return NextResponse.json({ error: 'trial_expired' }, { status: 402 });
  }

  const cost = CREDIT_COST.design ?? 4;
  let balanceAfter = UNLIMITED_BALANCE;

  if (!unlimited) {
    const balance = profile.credits ?? planCredits(plan);
    if (balance < cost) {
      return NextResponse.json({ error: 'insufficient_credits', balance }, { status: 402 });
    }
    balanceAfter = balance - cost;
    await db.from('profiles').update({ credits: balanceAfter }).eq('id', user.id);
    await db.from('credit_log').insert({
      user_id: user.id,
      delta: -cost,
      balance_after: balanceAfter,
      reason: 'Creative Studio design save',
    });
  }

  const row = {
    user_id: user.id,
    brand_id: design.brandId || null,
    name: design.name || 'Untitled design',
    width: design.width,
    height: design.height,
    data: design.data,
    updated_at: new Date().toISOString(),
  };

  const query = design.id
    ? db.from('designs').update(row).eq('id', design.id).eq('user_id', user.id).select('id').single()
    : db.from('designs').insert(row).select('id').single();

  const { data: saved, error: saveErr } = await query;

  if (saveErr || !saved) {
    if (!unlimited) {
      const restored = balanceAfter + cost;
      await db.from('profiles').update({ credits: restored }).eq('id', user.id);
      await db.from('credit_log').insert({
        user_id: user.id,
        delta: cost,
        balance_after: restored,
        reason: 'Refund — Creative Studio save failed',
      });
    }
    return NextResponse.json({ error: saveErr?.message || 'save_failed' }, { status: 500 });
  }

  return NextResponse.json({ id: saved.id, balance: balanceAfter });
}
