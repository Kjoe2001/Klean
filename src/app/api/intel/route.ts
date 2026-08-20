import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { CREDIT_COST, planCredits, type PlanKey } from '@/lib/plans';
import { isTrialExpired } from '@/lib/trial-guard';
export const maxDuration = 90;

const UNLIMITED_BALANCE = 999999;

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
    throw new Error(`Unable to initialize profile for credits: ${createdError?.message || 'unknown error'}`);
  }
  return created;
}

async function spendToolCredits(db: ReturnType<typeof admin>, user: any, tool: string) {
  const action = tool === 'campaign' ? 'campaign' : 'intel';
  const cost = CREDIT_COST[action] ?? 1;
  const label = action === 'campaign' ? 'Campaign build' : 'Trend / competitor intel';

  const profile = await ensureProfile(db, user);
  const unlimited = profile?.unlimited_credits === true || profile?.role === 'admin' || profile?.is_admin === true;
  if (unlimited) return { ok: true as const, unlimited: true, spent: 0, cost, balance: UNLIMITED_BALANCE };

  const plan = (profile?.plan || 'trial') as PlanKey;
  const bal = profile?.credits ?? planCredits(plan);
  if (isTrialExpired(profile)) return { ok: false as const, error: 'trial_expired' as const, needed: cost, balance: bal };
  if (bal < cost) return { ok: false as const, error: 'insufficient_credits' as const, needed: cost, balance: bal };

  const next = bal - cost;
  const { error: updateError } = await db.from('profiles').update({ credits: next }).eq('id', user.id);
  if (updateError) throw new Error(`Credit update failed: ${updateError.message}`);
  const { error: logError } = await db.from('credit_log').insert({
    user_id: user.id,
    delta: -cost,
    balance_after: next,
    reason: label,
  });
  if (logError) throw new Error(`Credit log failed: ${logError.message}`);

  return { ok: true as const, unlimited: false, spent: cost, cost, balance: next };
}

async function refundToolCredits(db: ReturnType<typeof admin>, userId: string, cost: number, currentBalance: number, reason: string) {
  const next = currentBalance + cost;
  await db.from('profiles').update({ credits: next }).eq('id', userId);
  await db.from('credit_log').insert({ user_id: userId, delta: cost, balance_after: next, reason });
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label}_timeout`)), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function summarizeAssets(assets: any[]) {
  if (!Array.isArray(assets) || !assets.length) return '';
  return assets
    .slice(0, 8)
    .map((a: any) => {
      const name = String(a?.name || 'Untitled asset');
      const folder = String(a?.folder || 'General');
      const type = String(a?.type || 'file');
      return `${name} (${folder}, ${type})`;
    })
    .join('; ');
}

async function getCampaignAssetContext(db: ReturnType<typeof admin>, userId: string) {
  const { data: profile, error } = await db.from('profiles').select('activation').eq('id', userId).single();
  if (!error) {
    const activation = (profile?.activation && typeof profile.activation === 'object') ? profile.activation : {};
    const uploadedAssets = Array.isArray((activation as any).uploaded_assets) ? (activation as any).uploaded_assets : [];
    const summary = summarizeAssets(uploadedAssets);
    return summary;
  }

  const { data: authUser, error: authErr } = await db.auth.admin.getUserById(userId);
  if (authErr || !authUser?.user) return '';
  const meta = (authUser.user.user_metadata && typeof authUser.user.user_metadata === 'object')
    ? authUser.user.user_metadata
    : {};
  const uploadedAssets = Array.isArray((meta as any).uploaded_assets) ? (meta as any).uploaded_assets : [];
  return summarizeAssets(uploadedAssets);
}

function buildFallbackCampaignPlan(input: any) {
  const brand = String(input?.brand || 'Your brand');
  const audience = String(input?.audience || 'core audience');
  const objective = String(input?.objective || 'Awareness');
  const budget = String(input?.budget || 'TBD');
  const weeks = String(input?.duration_weeks || '4');
  const offer = String(input?.offer || 'core value proposition');
  const platforms = String(input?.platform_mix || 'Instagram + TikTok');

  return {
    strategy: `${brand} will run a focused ${objective.toLowerCase()} campaign targeting ${audience} with platform-native creative and clear conversion paths. The message anchors on ${offer} and repeats across funnel stages. Budget ${budget} will be phased weekly and optimized by live KPI performance.`,
    media_plan: [
      { channel: platforms, share: '55%', rationale: 'Primary attention and engagement channels for the target audience.' },
      { channel: 'Meta Ads', share: '25%', rationale: 'Efficient conversion retargeting and lookalike expansion.' },
      { channel: 'Creator partnerships', share: '20%', rationale: 'Trust transfer and social proof at scale.' },
    ],
    channel_strategy: [
      'Launch with short-form video hooks and problem-first messaging.',
      'Retarget engagers with proof-led creatives and stronger CTAs.',
      'Repurpose top posts into paid variants every 72 hours.',
      'Run weekly creative audits and pause low-CTR assets quickly.',
    ],
    creative_angles: [
      `${brand}: before vs after transformation`,
      `Why ${audience} are switching now`,
      `Fast results from ${offer}`,
      'Common mistakes and the smarter alternative',
      'Social proof stories with measurable outcomes',
    ],
    content_plan: [
      { week: 1, theme: 'Problem awareness + bold hooks', assets: ['3 short videos', '2 static posts', '1 carousel'] },
      { week: 2, theme: 'Value proof + differentiators', assets: ['2 testimonials', '2 reels', '1 founder post'] },
      { week: 3, theme: 'Offer push + objections handling', assets: ['2 conversion ads', '1 FAQ carousel', '1 UGC edit'] },
      { week: 4, theme: 'Retention + referral momentum', assets: ['2 loyalty posts', '1 referral CTA', '1 recap video'] },
    ],
    influencer_plan: [
      'Nano creators: product demos and trust-led UGC.',
      'Mid-tier creators: comparison and proof-of-result narratives.',
      'Category experts: authority posts and conversion livestreams.',
    ],
    ad_funnel: [
      'Top: hook videos and educational problem framing.',
      'Middle: proof creatives, testimonials, and feature comparisons.',
      'Bottom: urgency, offer detail, and direct conversion CTA.',
    ],
    kpi_forecast: [
      { kpi: 'CTR', target: '1.8% - 2.8%' },
      { kpi: 'CPC', target: 'Reduce by 15% by week 4' },
      { kpi: 'Lead-to-sale conversion', target: '8% - 12%' },
    ],
    budget_allocation: [
      { item: 'Paid media', percent: 60 },
      { item: 'Creative production', percent: 25 },
      { item: 'Creator partnerships', percent: 15 },
    ],
    timeline: [
      { phase: 'Setup + launch assets', weeks: `Week 1 of ${weeks}` },
      { phase: 'Optimization + retargeting', weeks: `Week 2-3 of ${weeks}` },
      { phase: 'Scale winners + close strong', weeks: `Final week of ${weeks}` },
    ],
    risk_controls: [
      'Keep 2-3 backup creatives ready for fatigue replacement.',
      'Use daily spend caps and bid guardrails for unstable CPM days.',
      'Monitor comments and sentiment for brand-risk responses within 2 hours.',
    ],
    next_30_days: [
      'Finalize campaign brief, KPI dashboard, and asset calendar in 24 hours.',
      'Produce week-1 creative set and ad account structure by day 3.',
      'Launch and monitor first 72-hour performance checkpoint.',
      'Ship first optimization batch using CTR/CPC and watch-time signals.',
      'Publish end-of-month review with scale recommendations.',
    ],
  };
}

function parseModelJson(rawText: string): unknown {
  const candidates: string[] = [];
  const text = String(rawText || '').trim();

  candidates.push(text);
  candidates.push(text.replace(/^```json\s*/i, '').replace(/^```/i, '').replace(/```$/i, '').trim());

  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    candidates.push(text.slice(firstBrace, lastBrace + 1).trim());
  }

  for (const c of candidates) {
    if (!c) continue;
    try {
      return JSON.parse(c);
    } catch {
      // Try one light normalization pass (common trailing comma issue).
      try {
        const normalized = c
          .replace(/,\s*([}\]])/g, '$1')
          .replace(/[\u0000-\u001F]+/g, ' ')
          .trim();
        return JSON.parse(normalized);
      } catch {
        // Continue trying next candidate.
      }
    }
  }

  throw new Error('Model returned malformed JSON output.');
}

async function repairJsonWithModel(client: Anthropic, malformedText: string, schema: string): Promise<unknown> {
  const repairMsg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2500,
    system: 'You are a strict JSON formatter. Return ONLY valid minified JSON. Preserve the intended meaning and keys. No markdown.',
    messages: [{
      role: 'user',
      content: `Fix this into valid JSON that matches the schema.\nSchema: ${schema}\nMalformed input:\n${malformedText}`,
    }],
  } as any);

  const repairedText = (repairMsg as any).content
    .filter((b: any) => b.type === 'text')
    .map((b: any) => b.text)
    .join('')
    .trim();

  return parseModelJson(repairedText);
}

/** Shared engine for Campaign Builder, Trends, Competitors, Analytics insights */
const TOOLS: Record<string,{schema:string, sys:string, search?:boolean}> = {
  campaign: { sys: 'You are Zelvoo\'s campaign strategist.', schema:
    '{"strategy":"3 sentences","media_plan":[{"channel":"...","share":"%","rationale":"..."}],"channel_strategy":["4 tactical moves by platform"],"creative_angles":["5 campaign hooks"],"content_plan":[{"week":1,"theme":"...","assets":["..."]}],"influencer_plan":["3 tiers with roles"],"ad_funnel":["Top, middle, bottom funnel steps"],"kpi_forecast":[{"kpi":"...","target":"..."}],"budget_allocation":[{"item":"...","percent":0}],"timeline":[{"phase":"...","weeks":"..."}],"risk_controls":["3 risk and mitigation notes"],"next_30_days":["5 immediate actions"]}' },
  trends: { search: true, sys: 'You are Zelvoo\'s trend discovery engine. Use web search for CURRENT trends.', schema:
    '{"trending_hashtags":["8"],"viral_content":[{"format":"...","why":"..."}],"search_trends":["5"],"recommendations":["4 specific content moves"],"hot_topics":[{"topic":"...","angle":"..."}]}' },
  competitor: { search: true, sys: 'You are Zelvoo\'s competitor intelligence analyst. Use web search to research the competitor.', schema:
    '{"overview":"2 sentences","social_performance":[{"platform":"...","assessment":"..."}],"campaign_ideas":["3 they could not copy"],"content_gaps":["3"],"opportunities":["3 specific moves"]}' },
  insights: { sys: 'You are Zelvoo\'s analytics insight engine.', schema:
    '{"insights":["4 specific observations"],"actions":["3 prioritized recommendations"],"forecast":"one sentence"}' },
};

export async function POST(req: NextRequest) {
  try {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) return NextResponse.json({ error: 'AI not configured' }, { status: 500 });
    const client = new Anthropic({ apiKey: key });
    const db = admin();
    const user = await userFrom(req, db);
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const { tool, input } = await req.json();
    const t = TOOLS[tool];
    if (!t) return NextResponse.json({ error: 'Unknown tool' }, { status: 400 });

    let finalInput = input;
    if (tool === 'campaign') {
      const assetSummary = await getCampaignAssetContext(db, user.id);
      if (assetSummary) {
        finalInput = {
          ...input,
          asset_context: assetSummary,
          asset_context_note: 'Use these uploaded assets in creative direction, channel strategy, and content plan.',
        };
      }
    }

    const spend = await spendToolCredits(db, user, tool);
    if (!spend.ok) {
      return NextResponse.json({ error: spend.error, balance: spend.balance, needed: spend.needed }, { status: 402 });
    }

    try {
      const msg = await withTimeout(client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: tool === 'campaign' ? 1400 : 1200,
        system: t.sys + ' Respond ONLY with valid minified JSON, no fences.',
        messages: [{ role: 'user', content: `Input: ${JSON.stringify(finalInput)}\nToday: ${new Date().toDateString()}\nOutput exactly this schema: ${t.schema}` }],
        ...(t.search ? { tools: [{ type: 'web_search_20250305' as any, name: 'web_search' }] } : {}),
      } as any), tool === 'campaign' ? 28000 : 48000, 'model');

      const text = (msg as any).content
        .filter((b: any) => b.type === 'text')
        .map((b: any) => b.text)
        .join('')
        .trim();

      let data: unknown;
      try {
        data = parseModelJson(text);
      } catch {
        try {
          data = await withTimeout(repairJsonWithModel(client, text, t.schema), 9000, 'json_repair');
        } catch {
          if (!spend.unlimited) {
            await refundToolCredits(db, user.id, spend.cost, spend.balance, 'Refund: intel generation failed');
          }
          return NextResponse.json({ error: 'Model returned malformed JSON output.' }, { status: 400 });
        }
      }

      return NextResponse.json({ data, balance: spend.balance });
    } catch (runtimeError: any) {
      const isTimeout = String(runtimeError?.message || '').includes('timeout');
      if (isTimeout && tool === 'campaign') {
        try {
          const retryMsg = await withTimeout(client.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 900,
            system: `${t.sys} You are in fast mode. Keep each value concise. Respond ONLY with valid minified JSON, no fences.`,
            messages: [{ role: 'user', content: `FAST MODE: generate concise output only. Input: ${JSON.stringify(finalInput)}\nOutput exactly this schema: ${t.schema}` }],
          } as any), 15000, 'model_retry');

          const retryText = (retryMsg as any).content
            .filter((b: any) => b.type === 'text')
            .map((b: any) => b.text)
            .join('')
            .trim();

          let retryData: unknown;
          try {
            retryData = parseModelJson(retryText);
          } catch {
            retryData = await withTimeout(repairJsonWithModel(client, retryText, t.schema), 5000, 'json_repair_retry');
          }

          return NextResponse.json({ data: retryData, balance: spend.balance, mode: 'fast-retry' });
        } catch {
          const fallback = buildFallbackCampaignPlan(finalInput);
          return NextResponse.json({ data: fallback, balance: spend.balance, mode: 'fallback' });
        }
      }

      if (!spend.unlimited) {
        await refundToolCredits(db, user.id, spend.cost, spend.balance, 'Refund: intel generation failed');
      }
      if (isTimeout) {
        return NextResponse.json({ error: 'Request timed out. Please retry with a shorter brief.' }, { status: 504 });
      }
      throw runtimeError;
    }
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
