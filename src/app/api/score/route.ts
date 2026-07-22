import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { CREDIT_COST, planCredits, type PlanKey } from '@/lib/plans';
export const maxDuration = 30;

const UNLIMITED_BALANCE = 999999;

type ScorePayload = {
  virality: number;
  engagement: number;
  readability: number;
  brand_fit: number;
  verdict: string;
};

function clampScore(value: any) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function normalizeScorePayload(raw: any): ScorePayload {
  return {
    virality: clampScore(raw?.virality),
    engagement: clampScore(raw?.engagement),
    readability: clampScore(raw?.readability),
    brand_fit: clampScore(raw?.brand_fit),
    verdict: String(raw?.verdict || 'Scoring completed.').slice(0, 140),
  };
}

function extractJsonCandidate(text: string) {
  const cleaned = String(text || '').replace(/```json|```/gi, '').trim();
  const start = cleaned.search(/[\[{]/);
  if (start < 0) return cleaned;

  let depth = 0;
  let inString = false;
  let escaped = false;
  let end = -1;

  for (let i = start; i < cleaned.length; i += 1) {
    const ch = cleaned[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === '{' || ch === '[') depth += 1;
    if (ch === '}' || ch === ']') {
      depth -= 1;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }

  const candidate = end > start ? cleaned.slice(start, end) : cleaned.slice(start);
  return candidate.replace(/,\s*([}\]])/g, '$1').trim();
}

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
    throw new Error(`Could not initialize profile for scoring: ${createdError?.message || 'unknown error'}`);
  }
  return created;
}

async function spendScoreCredits(db: ReturnType<typeof admin>, user: any) {
  const cost = CREDIT_COST.score ?? 1;
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
    reason: 'AI scoring',
  });
  if (logError) throw new Error(`Credit log failed: ${logError.message}`);

  return { ok: true as const, unlimited: false, cost, balance: next };
}

async function refundScoreCredits(db: ReturnType<typeof admin>, userId: string, cost: number, currentBalance: number, reason: string) {
  const next = currentBalance + cost;
  await db.from('profiles').update({ credits: next }).eq('id', userId);
  await db.from('credit_log').insert({ user_id: userId, delta: cost, balance_after: next, reason });
}

async function parseScoreJson(client: Anthropic, text: string) {
  let candidate = extractJsonCandidate(text);
  try {
    return normalizeScorePayload(JSON.parse(candidate));
  } catch {
    const repair = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      system: 'Fix malformed JSON only. Return valid minified JSON and nothing else.',
      messages: [{
        role: 'user',
        content: `Repair this to valid JSON for schema: {"virality":0-100,"engagement":0-100,"readability":0-100,"brand_fit":0-100,"verdict":"max 20 words"}\n\nRAW OUTPUT:\n${candidate}`,
      }],
    });
    const fixed = repair.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('');
    candidate = extractJsonCandidate(fixed);
    return normalizeScorePayload(JSON.parse(candidate));
  }
}

export async function POST(req: NextRequest) {
  try {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) return NextResponse.json({ error: 'AI not configured' }, { status: 500 });
    const client = new Anthropic({ apiKey: key });
    const db = admin();
    const user = await userFrom(req, db);
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const spend = await spendScoreCredits(db, user);
    if (!spend.ok) {
      return NextResponse.json({ error: 'insufficient_credits', balance: spend.balance, needed: spend.needed }, { status: 402 });
    }

    const { content, brief } = await req.json();
    try {
      const msg = await client.messages.create({
        model: 'claude-sonnet-4-6', max_tokens: 400,
        system: 'You are Zelvoo\'s performance prediction engine. Respond ONLY with minified JSON.',
        messages: [{ role: 'user', content:
          `Score this content for brand ${brief?.brand} (${brief?.platform}). Schema: {"virality":0-100,"engagement":0-100,"readability":0-100,"brand_fit":0-100,"verdict":"max 20 words"}\nCONTENT:\n${JSON.stringify(content).slice(0, 3000)}` }],
      });
      const text = msg.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('');
      let data: ScorePayload;
      try {
        data = await parseScoreJson(client, text);
      } catch {
        data = {
          virality: 0,
          engagement: 0,
          readability: 0,
          brand_fit: 0,
          verdict: 'Scoring unavailable. Please retry.',
        };
      }
      return NextResponse.json({ data, balance: spend.balance });
    } catch (error: any) {
      if (!spend.unlimited) {
        await refundScoreCredits(db, user.id, spend.cost, spend.balance, 'Refund: scoring failed');
      }
      throw error;
    }
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
