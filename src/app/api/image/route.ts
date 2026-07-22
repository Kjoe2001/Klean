import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CREDIT_COST, planCredits, type PlanKey } from '@/lib/plans';

export const maxDuration = 60;

const UNLIMITED_BALANCE = 999999;
const MODEL = 'gemini-3-pro-image'; // "Nano Banana Pro" — Google's flagship image model

// Maps the app's IMAGE_SIZES presets (src/lib/image-presets.ts) to the model's
// supported aspect ratios.
const ASPECT_RATIO: Record<string, string> = {
  square: '1:1',
  portrait: '4:5',
  landscape: '16:9',
  story: '9:16',
  reel: '9:16',
  youtube: '16:9',
  linkedin: '16:9', // closest match to 1.91:1 — no exact option
};

function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

async function ensureImagesBucket(db: ReturnType<typeof admin>) {
  const bucketName = 'generated-images';
  const { data: existing, error: getError } = await db.storage.getBucket(bucketName);
  if (!getError && existing) return;

  const { error: createError } = await db.storage.createBucket(bucketName, { public: true });
  if (createError && !/already exists/i.test(createError.message || '')) {
    throw new Error(`Could not create generated-images bucket: ${createError.message}`);
  }
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

async function generateImageBytes(prompt: string, aspectRatio: string) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('Image generation is not configured.');

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ['IMAGE'],
          imageConfig: { aspectRatio },
        },
      }),
    }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || 'Image generation failed to start.');
  }

  const parts: any[] = data?.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((p) => p.inlineData?.data);
  if (!imagePart) {
    const blockReason = data?.promptFeedback?.blockReason;
    throw new Error(blockReason ? `Blocked: ${blockReason}` : 'Image generation returned no output.');
  }

  return {
    buffer: Buffer.from(imagePart.inlineData.data, 'base64'),
    mimeType: imagePart.inlineData.mimeType || 'image/png',
  };
}

async function uploadGeneratedImage(db: ReturnType<typeof admin>, userId: string, buffer: Buffer, mimeType: string) {
  await ensureImagesBucket(db);
  const ext = mimeType.split('/')[1]?.split('+')[0] || 'png';
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await db.storage.from('generated-images').upload(path, buffer, {
    contentType: mimeType,
    upsert: false,
  });
  if (uploadError) throw new Error(`Could not save generated image: ${uploadError.message}`);

  const { data: pub } = db.storage.from('generated-images').getPublicUrl(path);
  return pub.publicUrl;
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
      const { buffer, mimeType } = await generateImageBytes(prompt, aspectRatio);
      const url = await uploadGeneratedImage(db, user.id, buffer, mimeType);

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
