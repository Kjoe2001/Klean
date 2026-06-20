import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const SYSTEM = `You are Zelvoo Copilot, the in-app AI marketing strategist for Zelvoo —
Africa's AI marketing operating system. You help brands, agencies and creators with
content strategy, campaign ideas, captions, audience insight and growth tactics.
Be concrete, action-oriented and brief. When useful, suggest which Zelvoo module to use
next (Content Studio, Image Studio, Campaign Builder, Calendar, Trends, Competitors).
Context: many users are in Ghana and across Africa; respect local market nuance.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, brand } = await req.json();
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) return NextResponse.json({ error: 'AI not configured' }, { status: 500 });
    const anthropic = new Anthropic({ apiKey: key });
    const sys = brand ? `${SYSTEM}\n\nActive brand: ${JSON.stringify(brand)}` : SYSTEM;
    const r = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: sys,
      messages: (messages || []).map((m: any) => ({ role: m.role, content: m.content })),
    });
    const text = r.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('\n');
    return NextResponse.json({ reply: text });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Assistant failed' }, { status: 500 });
  }
}
