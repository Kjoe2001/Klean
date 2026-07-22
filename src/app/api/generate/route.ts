import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { planCredits, type PlanKey } from '@/lib/plans';

export const maxDuration = 60;

const SCHEMAS: Record<string,string> = {
  hooks: '{"items":["..."]}',
  post: '{"items":[{"title":"...","format":"Reel/Carousel/Static/Story","idea":"...","cta":"..."}]}',
  caption: '{"captions":["3 captions, 2-3 lines, \\n breaks, CTA"],"hashtags":["10 tags no #"]}',
  carousel: '{"items":[{"slide":1,"title":"...","body":"max 18 words"}]}',
  reel: '{"duration":"30s","beats":[{"time":"0-3s","visual":"...","voiceover":"..."}]}',
  video: '{"duration":"60-90s","sections":[{"label":"Hook/Setup/Value/CTA","script":"..."}]}',
  blog: '{"title":"SEO title","meta":"155 char meta","outline":["H2 sections"],"intro":"2 paragraphs","keywords":["8"]}',
  email: '{"emails":[{"day":1,"subject":"...","preview":"...","body":"short email with \\n"}]}',
  linkedin: '{"hook":"first line","body":"article with \\n breaks, 200-300 words","hashtags":["5"]}',
  product: '{"headline":"...","description":"120 words","bullets":["5 benefit bullets"],"seo_title":"..."}',
  press: '{"headline":"...","subhead":"...","dateline":"CITY, Date —","body":"3 paragraphs with \\n","boilerplate":"..."}',
  adcopy: '{"variants":[{"platform":"Meta/Google","headline":"...","primary":"...","cta":"..."}]}',
  landing: '{"hero":{"headline":"...","sub":"...","cta":"..."},"sections":[{"title":"...","copy":"..."}],"faq":[{"q":"...","a":"..."}]}',
  podcast: '{"title":"...","intro":"...","segments":[{"name":"...","talking_points":["..."]}],"outro":"..."}',
  newsletter: '{"subject":"...","sections":[{"heading":"...","copy":"..."}],"cta":"..."}',
  seo: '{"primary_keyword":"...","secondary":["6"],"title_tag":"...","meta":"...","h_structure":["H1/H2s"],"faq":[{"q":"...","a":"..."}]}',
};

const OUTPUT_RULES: Record<string, string> = {
  hooks: 'Return exactly 10 items in items. Keep each hook <= 12 words.',
  post: 'Return exactly 7 items in items. idea should be concise (<= 25 words).',
  caption: 'Return exactly 3 captions and exactly 10 hashtags.',
  carousel: 'Return exactly 5 items in items with slide values 1..5.',
  reel: 'Return 4 to 5 beats.',
  email: 'Return exactly 3 emails.',
  adcopy: 'Return exactly 4 variants.',
};

const UNLIMITED_BALANCE = 999999;

function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

function isMissingActivationColumnError(error: any) {
  const msg = String(error?.message || error || '');
  return /column\s+profiles\.activation\s+does not exist|column\s+activation\s+does not exist/i.test(msg);
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
    throw new Error(`Could not initialize profile for generation: ${createdError?.message || 'unknown error'}`);
  }
  return created;
}

function extractJsonCandidate(text: string) {
  const cleaned = text.replace(/```json|```/g, '').trim();
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
  return candidate.replace(/,\s*([}\]])/g, '$1');
}

async function parseGeneratedJson(client: Anthropic, schema: string, text: string, type: string) {
  let candidate = extractJsonCandidate(text);
  try {
    return JSON.parse(candidate);
  } catch (firstError: any) {
    let lastErrorMessage = firstError?.message || 'json_parse_error';
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      const repair = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2200,
        system: 'You are a strict JSON repair engine. Return ONLY valid minified JSON, no markdown, no prose.',
        messages: [{
          role: 'user',
          content: `Fix this malformed JSON for content type "${type}".\nSchema: ${schema}\nRules: ${(OUTPUT_RULES[type] || 'Match the schema exactly.')}\nParse error: ${lastErrorMessage}\nMalformed JSON:\n${candidate}`,
        }],
      });
      const fixed = repair.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('');
      candidate = extractJsonCandidate(fixed);
      try {
        return JSON.parse(candidate);
      } catch (repairError: any) {
        lastErrorMessage = repairError?.message || 'json_parse_error';
      }
    }
    throw new Error('Model returned malformed JSON output. Please retry.');
  }
}

async function spendOneCredit(db: ReturnType<typeof admin>, user: any, label: string) {
  const profile = await ensureProfile(db, user);
  const unlimited = profile?.unlimited_credits === true || profile?.role === 'admin' || profile?.is_admin === true;
  if (unlimited) return { balance: UNLIMITED_BALANCE, unlimited: true, spent: 0 };

  const plan = (profile?.plan || 'trial') as PlanKey;
  const current = profile?.credits ?? planCredits(plan);
  if (current < 1) {
    return { ok: false, balance: current, needed: 1 } as const;
  }

  const next = current - 1;
  const { error: updateError } = await db.from('profiles').update({ credits: next }).eq('id', user.id);
  if (updateError) throw new Error(`Credit update failed: ${updateError.message}`);
  const { error: logError } = await db.from('credit_log').insert({ user_id: user.id, delta: -1, balance_after: next, reason: label });
  if (logError) throw new Error(`Credit log failed: ${logError.message}`);
  return { balance: next, unlimited: false, spent: 1 };
}

async function refundOneCredit(db: ReturnType<typeof admin>, userId: string, balanceAfterRefund: number, label: string) {
  await db.from('profiles').update({ credits: balanceAfterRefund }).eq('id', userId);
  await db.from('credit_log').insert({ user_id: userId, delta: 1, balance_after: balanceAfterRefund, reason: label });
}

async function saveGeneratedItem(db: ReturnType<typeof admin>, userId: string, item: any): Promise<'activation' | 'content_table'> {
  const { data: profile, error: profileError } = await db.from('profiles').select('activation').eq('id', userId).single();
  if (!profileError) {
    const activation = (profile?.activation && typeof profile.activation === 'object') ? profile.activation : {};
    const generatedItems = Array.isArray((activation as any).generated_items) ? (activation as any).generated_items : [];
    const nextItems = [item, ...generatedItems].slice(0, 100);
    const nextActivation = { ...activation, generated_items: nextItems };

    const { error: updateError } = await db.from('profiles').update({ activation: nextActivation }).eq('id', userId);
    if (!updateError) return 'activation';
    if (!isMissingActivationColumnError(updateError)) {
      throw new Error(`Saved result failed: ${updateError.message}`);
    }
  } else if (!isMissingActivationColumnError(profileError)) {
    throw new Error(`Saved result failed: ${profileError.message}`);
  }

  const { error: contentError } = await db
    .from('content')
    .insert({
      user_id: userId,
      brand_id: item.brand_id || null,
      type: item.type,
      title: item.title,
      body: item.body,
    });

  if (contentError) {
    throw new Error(`Saved result failed: ${contentError.message}`);
  }

  return 'content_table';
}

export async function POST(req: NextRequest) {
  try {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) return NextResponse.json({ error: 'AI not configured' }, { status: 500 });
    const client = new Anthropic({ apiKey: key });
    const db = admin();
    const user = await userFrom(req, db);
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const { type, brief, brand } = await req.json();
    if (!SCHEMAS[type]) return NextResponse.json({ error: 'Unknown content type' }, { status: 400 });

    const spend = await spendOneCredit(db, user, 'Content generation');
    if ('ok' in spend && spend.ok === false) {
      return NextResponse.json({ error: 'insufficient_credits', balance: spend.balance, needed: spend.needed }, { status: 402 });
    }

    const brandCtx = brand ? `\nBRAND KIT (follow strictly): tone="${brand.tone||''}", taglines="${brand.taglines||''}", guidelines="${brand.guidelines||''}", colors=${JSON.stringify(brand.colors||[])}` : '';
    const system = `You are Zelvoo, the most advanced AI content engine. Produce immediately usable, platform-native marketing content. Zero fluff.${brandCtx}
BRIEF: Brand: ${brief.brand} | Industry: ${brief.industry} | Audience: ${brief.audience} | Tone: ${brief.tone} | Platform: ${brief.platform} | Focus: ${brief.focus||'brand growth'}
Respond ONLY with valid minified JSON. No fences, no preamble.`;

    try {
      const msg = await client.messages.create({
        model: 'claude-sonnet-4-6', max_tokens: 2500, system,
        messages: [{ role: 'user', content: `Generate "${type}" in exactly this schema: ${SCHEMAS[type]}\n${OUTPUT_RULES[type] || ''}` }],
      });
      const text = msg.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('');
      const data = await parseGeneratedJson(client, SCHEMAS[type], text, type);

      const title = `${brief.brand} — ${type}`;
      const savedSource = await saveGeneratedItem(db, user.id, {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        user_id: user.id,
        brand_id: brand?.id || null,
        type,
        title,
        body: data,
        created_at: new Date().toISOString(),
      });

      return NextResponse.json({ data, balance: spend.balance, saved: true, savedSource });
    } catch (generationError: any) {
      if (!spend.unlimited) {
        await refundOneCredit(db, user.id, spend.balance + 1, 'Refund: content generation failed');
      }
      throw generationError;
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
