import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CREDIT_COST, planCredits, type PlanKey } from '@/lib/plans';

export const maxDuration = 60;

const UNLIMITED_BALANCE = 999999;
const MODEL = 'black-forest-labs/flux-1.1-pro-ultra';

// Maps the app's IMAGE_SIZES presets (src/lib/image-presets.ts) to the model's
// supported aspect_ratio enum.
const ASPECT_RATIO: Record<string, string> = {
  square: '1:1',
  portrait: '4:5',
  landscape: '16:9',
  story: '9:16',
  reel: '9:16',
  youtube: '16:9',
  linkedin: '16:9', // closest enum match to 1.91:1 — model has no exact option
};

function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

async function userFrom(req: NextRequest, db: ReturnType<typeof admin>) {
  const auth = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!auth) return null;
  const { data } = await db.auth.getUser(auth);
  return data?.user ?? null;
}

async function ensureProfile(db: ReturnType<typeof admin>, user: any) {
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
    throw new Error(`Could not initialize profile for image generation: ${createdError?.message || 'unknown error'}`);
  }
  return created;
}

async function spendImageCredits(db: ReturnType<typeof admin>, user: any) {
  const cost = CREDIT_COST.image ?? 8;
  const profile = await ensureProfile(db, user);
  const unlimited = profile?.unlimited_credits === true || profile?.role === 'admin' || profile?.is_admin === true;
  if (unlimited) return { ok: true as const, unlimited: true, cost, balance: UNLIMITED_BALANCE };

  const plan = (profile?.plan || 'trial') as PlanKey;
  const balance = profile?.credits ?? planCredits(plan);
  if (balance < cost) return { ok: false as const, needed: cost, balance };

  const next = balance - cost;
  const { error: updateError } = await db.from('profiles').update({ credits: next }).eq('id', user.id);
  if (updateError) throw new Error(`Credit update failed: ${updateError.message}`);
  const { error: logError } = await db.from('credit_log').insert({
    user_id: user.id,
    delta: -cost,
    balance_after: next,
    reason: 'AI image generation',
  });
  if (logError) throw new Error(`Credit log failed: ${logError.message}`);

  return { ok: true as const, unlimited: false, cost, balance: next };
}

async function refundImageCredits(db: ReturnType<typeof admin>, userId: string, cost: number, currentBalance: number, reason: string) {
  const next = currentBalance + cost;
  await db.from('profiles').update({ credits: next }).eq('id', userId);
  await db.from('credit_log').insert({ user_id: userId, delta: cost, balance_after: next, reason });
}

async function runPrediction(prompt: string, aspectRatio: string) {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error('Image generation is not configured.');

  const res = await fetch(`https://api.replicate.com/v1/models/${MODEL}/predictions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'wait',
    },
    body: JSON.stringify({
      input: {
        prompt,
        aspect_ratio: aspectRatio,
        output_format: 'jpg',
        safety_tolerance: 2,
      },
    }),
  });

  let prediction = await res.json();
  if (!res.ok) throw new Error(prediction?.detail || 'Image generation failed to start.');

  const deadline = Date.now() + 50_000;
  while (prediction.status !== 'succeeded' && prediction.status !== 'failed' && prediction.status !== 'canceled') {
    if (Date.now() > deadline) throw new Error('Image generation timed out. Please try again.');
    await new Promise((r) => setTimeout(r, 1500));
    const poll = await fetch(prediction.urls.get, { headers: { Authorization: `Bearer ${token}` } });
    prediction = await poll.json();
  }

  if (prediction.status !== 'succeeded') {
    throw new Error(prediction?.error || 'Image generation failed.');
  }

  const url = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
  if (!url) throw new Error('Image generation returned no output.');
  return url as string;
}

export async function POST(req: NextRequest) {
  try {
    const db = admin();
    const user = await userFrom(req, db);
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const { prompt, mode, size, brandId } = await req.json();
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'A prompt is required.' }, { status: 400 });
    }

    const spend = await spendImageCredits(db, user);
    if (!spend.ok) {
      return NextResponse.json({ error: 'insufficient_credits', balance: spend.balance, needed: spend.needed }, { status: 402 });
    }

    const aspectRatio = ASPECT_RATIO[size] || '1:1';

    try {
      const url = await runPrediction(prompt, aspectRatio);

      const { error: insertError } = await db.from('images').insert({
        user_id: user.id,
        brand_id: brandId || null,
        prompt,
        mode: mode || null,
        size: size || null,
        url,
      });
      if (insertError) throw new Error(`Saved image failed: ${insertError.message}`);

      return NextResponse.json({ url, balance: spend.balance });
    } catch (genError: any) {
      if (!spend.unlimited) {
        await refundImageCredits(db, user.id, spend.cost, spend.balance, 'Refund: image generation failed');
      }
      throw genError;
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
