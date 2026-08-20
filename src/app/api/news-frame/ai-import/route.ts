import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { CREDIT_COST, planCredits, type PlanKey } from '@/lib/plans';
import { isTrialExpired } from '@/lib/trial-guard';

export const maxDuration = 60;

const UNLIMITED_BALANCE = 999999;
const BUCKET = 'news-frames';
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // ~8MB source file
const ALLOWED_MEDIA_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const FONT_CATEGORIES = ['bold-sans', 'condensed', 'serif', 'elegant'] as const;
type FontCategory = (typeof FONT_CATEGORIES)[number];

type Zone = { x: number; y: number; w: number; h: number };
type ExtractedFrame = {
  headline_zone: Zone;
  logo_zone: Zone;
  colors: string[];
  text_color: string;
  font_category: FontCategory;
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
    throw new Error(`Could not initialize profile for card import: ${createdError?.message || 'unknown error'}`);
  }
  return created;
}

async function spendCardImportCredit(db: ReturnType<typeof admin>, user: any) {
  const cost = CREDIT_COST.card_import ?? 4;
  const profile = await ensureProfile(db, user);
  const unlimited = profile?.unlimited_credits === true || profile?.role === 'admin' || profile?.is_admin === true;
  if (unlimited) return { ok: true as const, unlimited: true, cost, balance: UNLIMITED_BALANCE };

  const plan = (profile?.plan || 'trial') as PlanKey;
  const balance = profile?.credits ?? planCredits(plan);
  if (isTrialExpired(profile)) return { ok: false as const, error: 'trial_expired' as const, needed: cost, balance };
  if (balance < cost) return { ok: false as const, error: 'insufficient_credits' as const, needed: cost, balance };

  const next = balance - cost;
  const { error: updateError } = await db.from('profiles').update({ credits: next }).eq('id', user.id);
  if (updateError) throw new Error(`Credit update failed: ${updateError.message}`);
  const { error: logError } = await db.from('credit_log').insert({
    user_id: user.id,
    delta: -cost,
    balance_after: next,
    reason: 'News Frame Studio AI card import',
  });
  if (logError) throw new Error(`Credit log failed: ${logError.message}`);

  return { ok: true as const, unlimited: false, cost, balance: next };
}

async function refundCardImportCredit(db: ReturnType<typeof admin>, userId: string, cost: number, currentBalance: number, reason: string) {
  const next = currentBalance + cost;
  await db.from('profiles').update({ credits: next }).eq('id', userId);
  await db.from('credit_log').insert({ user_id: userId, delta: cost, balance_after: next, reason });
}

async function ensureBucket(db: ReturnType<typeof admin>) {
  const { data: existing, error: getError } = await db.storage.getBucket(BUCKET);
  if (!getError && existing) return;
  const { error: createError } = await db.storage.createBucket(BUCKET, { public: true });
  if (createError && !/already exists/i.test(createError.message || '')) {
    throw new Error(`Could not create ${BUCKET} bucket: ${createError.message}`);
  }
}

function clampPct(n: any, fallback: number) {
  const v = Number(n);
  if (!Number.isFinite(v)) return fallback;
  return Math.max(0, Math.min(100, v));
}

function isHexColor(v: any): v is string {
  return typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v);
}

function extractJsonCandidate(text: string) {
  const cleaned = String(text || '').replace(/```json|```/gi, '').trim();
  const start = cleaned.search(/[\[{]/);
  if (start < 0) return cleaned;
  let depth = 0, inString = false, escaped = false, end = -1;
  for (let i = start; i < cleaned.length; i += 1) {
    const ch = cleaned[i];
    if (escaped) { escaped = false; continue; }
    if (ch === '\\') { escaped = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{' || ch === '[') depth += 1;
    if (ch === '}' || ch === ']') { depth -= 1; if (depth === 0) { end = i + 1; break; } }
  }
  const candidate = end > start ? cleaned.slice(start, end) : cleaned.slice(start);
  return candidate.replace(/,\s*([}\]])/g, '$1').trim();
}

function normalizeZone(raw: any, fallback: Zone): Zone {
  if (!raw || typeof raw !== 'object') return fallback;
  return {
    x: clampPct(raw.x, fallback.x),
    y: clampPct(raw.y, fallback.y),
    w: clampPct(raw.w, fallback.w),
    h: clampPct(raw.h, fallback.h),
  };
}

function normalizeExtraction(raw: any): ExtractedFrame {
  const colors = Array.isArray(raw?.colors)
    ? raw.colors.filter(isHexColor).slice(0, 4)
    : [];
  return {
    headline_zone: normalizeZone(raw?.headline_zone, { x: 9, y: 63, w: 82, h: 22 }),
    logo_zone: normalizeZone(raw?.logo_zone, { x: 4, y: 5, w: 20, h: 8 }),
    colors: colors.length ? colors : ['#00DF81', '#062C24'],
    text_color: isHexColor(raw?.text_color) ? raw.text_color : '#FFFFFF',
    font_category: FONT_CATEGORIES.includes(raw?.font_category) ? raw.font_category : 'bold-sans',
  };
}

export async function GET(req: NextRequest) {
  const db = admin();
  const user = await userFrom(req, db);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data: profile } = await db.from('profiles').select('activation').eq('id', user.id).single();
  const activation = (profile?.activation && typeof profile.activation === 'object') ? profile.activation : {};
  const frames = Array.isArray((activation as any).news_frames) ? (activation as any).news_frames : [];
  return NextResponse.json({ frames });
}

export async function POST(req: NextRequest) {
  try {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) return NextResponse.json({ error: 'AI not configured' }, { status: 500 });
    const db = admin();
    const user = await userFrom(req, db);
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => null);
    const imageBase64 = typeof body?.imageBase64 === 'string' ? body.imageBase64 : '';
    const mediaType = typeof body?.mediaType === 'string' ? body.mediaType : '';
    const name = typeof body?.name === 'string' ? body.name.slice(0, 80) : 'Untitled card';

    if (!imageBase64 || !ALLOWED_MEDIA_TYPES.has(mediaType)) {
      return NextResponse.json({ error: 'Please upload a PNG, JPG, or WEBP image.' }, { status: 400 });
    }
    const approxBytes = Math.ceil((imageBase64.length * 3) / 4);
    if (approxBytes > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: 'Image is too large (max 8MB).' }, { status: 400 });
    }

    const spend = await spendCardImportCredit(db, user);
    if (!spend.ok) {
      return NextResponse.json({ error: spend.error, balance: spend.balance, needed: spend.needed }, { status: 402 });
    }

    try {
      const client = new Anthropic({ apiKey: key });
      const msg = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        system: 'You are a layout-analysis engine for a news broadcast card design tool. Respond ONLY with minified JSON, no prose, no markdown fences.',
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } },
            {
              type: 'text',
              text:
                'Analyze this news card/graphic template. Identify: the headline text zone (where the main headline text sits or would sit), ' +
                'the logo/brand mark zone, the 2-4 dominant brand colors, a text color that would contrast well over the headline zone, ' +
                'and a font style category. All zone coordinates are PERCENTAGES (0-100) of image width/height, measured from the top-left. ' +
                'Respond with exactly this schema: {"headline_zone":{"x":0-100,"y":0-100,"w":0-100,"h":0-100},"logo_zone":{"x":0-100,"y":0-100,"w":0-100,"h":0-100},' +
                '"colors":["#RRGGBB","#RRGGBB"],"text_color":"#RRGGBB","font_category":"bold-sans|condensed|serif|elegant"}',
            },
          ] as any,
        }],
      });

      const text = msg.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('');
      let extracted: ExtractedFrame;
      try {
        extracted = normalizeExtraction(JSON.parse(extractJsonCandidate(text)));
      } catch {
        extracted = normalizeExtraction(null);
      }

      await ensureBucket(db);
      const ext = mediaType === 'image/png' ? 'png' : mediaType === 'image/webp' ? 'webp' : 'jpg';
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await db.storage.from(BUCKET).upload(path, Buffer.from(imageBase64, 'base64'), {
        contentType: mediaType,
        upsert: false,
      });
      if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);
      const { data: pub } = db.storage.from(BUCKET).getPublicUrl(path);

      const frame = {
        id: `frame-${Date.now()}`,
        name,
        image_url: pub.publicUrl,
        created_at: new Date().toISOString(),
        ...extracted,
      };

      const { data: profileRow } = await db.from('profiles').select('activation').eq('id', user.id).single();
      const activation = (profileRow?.activation && typeof profileRow.activation === 'object') ? profileRow.activation : {};
      const existingFrames = Array.isArray((activation as any).news_frames) ? (activation as any).news_frames : [];
      const nextFrames = [frame, ...existingFrames].slice(0, 50);
      await db.from('profiles').update({ activation: { ...activation, news_frames: nextFrames } }).eq('id', user.id);

      return NextResponse.json({ ok: true, frame, balance: spend.balance });
    } catch (error: any) {
      if (!spend.unlimited) {
        await refundCardImportCredit(db, user.id, spend.cost, spend.balance, 'Refund: card import failed');
      }
      throw error;
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
