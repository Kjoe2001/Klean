import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
export const maxDuration = 60;
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/** Shared engine for Campaign Builder, Trends, Competitors, Analytics insights */
const TOOLS: Record<string,{schema:string, sys:string, search?:boolean}> = {
  campaign: { sys: 'You are Zelvoo\'s campaign strategist.', schema:
    '{"strategy":"3 sentences","media_plan":[{"channel":"...","share":"%","rationale":"..."}],"content_plan":[{"week":1,"theme":"...","assets":["..."]}],"influencer_plan":["3 tiers with roles"],"kpi_forecast":[{"kpi":"...","target":"..."}],"budget_allocation":[{"item":"...","percent":0}],"timeline":[{"phase":"...","weeks":"..."}]}' },
  trends: { search: true, sys: 'You are Zelvoo\'s trend discovery engine. Use web search for CURRENT trends.', schema:
    '{"trending_hashtags":["8"],"viral_content":[{"format":"...","why":"..."}],"search_trends":["5"],"recommendations":["4 specific content moves"],"hot_topics":[{"topic":"...","angle":"..."}]}' },
  competitor: { search: true, sys: 'You are Zelvoo\'s competitor intelligence analyst. Use web search to research the competitor.', schema:
    '{"overview":"2 sentences","social_performance":[{"platform":"...","assessment":"..."}],"campaign_ideas":["3 they could not copy"],"content_gaps":["3"],"opportunities":["3 specific moves"]}' },
  insights: { sys: 'You are Zelvoo\'s analytics insight engine.', schema:
    '{"insights":["4 specific observations"],"actions":["3 prioritized recommendations"],"forecast":"one sentence"}' },
};

export async function POST(req: NextRequest) {
  try {
    const { tool, input } = await req.json();
    const t = TOOLS[tool];
    if (!t) return NextResponse.json({ error: 'Unknown tool' }, { status: 400 });
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6', max_tokens: 2500,
      system: t.sys + ' Respond ONLY with valid minified JSON, no fences.',
      messages: [{ role: 'user', content: `Input: ${JSON.stringify(input)}\nToday: ${new Date().toDateString()}\nOutput exactly this schema: ${t.schema}` }],
      ...(t.search ? { tools: [{ type: 'web_search_20250305' as any, name: 'web_search' }] } : {}),
    } as any);
    const text = (msg as any).content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('');
    const data = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));
    return NextResponse.json({ data });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
