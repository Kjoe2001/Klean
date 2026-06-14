import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
export const maxDuration = 30;
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { content, brief } = await req.json();
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6', max_tokens: 400,
      system: 'You are Zelvo\'s performance prediction engine. Respond ONLY with minified JSON.',
      messages: [{ role: 'user', content:
        `Score this content for brand ${brief?.brand} (${brief?.platform}). Schema: {"virality":0-100,"engagement":0-100,"readability":0-100,"brand_fit":0-100,"verdict":"max 20 words"}\nCONTENT:\n${JSON.stringify(content).slice(0, 3000)}` }],
    });
    const text = msg.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('');
    const data = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));
    return NextResponse.json({ data });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
