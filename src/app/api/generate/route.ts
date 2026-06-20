import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const maxDuration = 60;
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SCHEMAS: Record<string,string> = {
  hooks: '{"items":["10 hooks, max 12 words, varied angles"]}',
  post: '{"items":[{"title":"...","format":"Reel/Carousel/Static/Story","idea":"max 25 words","cta":"...","image_prompt":"visual scene, no text"}]} — 7 items',
  caption: '{"captions":["3 captions, 2-3 lines, \\n breaks, CTA"],"hashtags":["10 tags no #"]}',
  carousel: '{"items":[{"slide":1,"title":"...","body":"max 18 words","image_prompt":"visual scene, no text"}]} — 5 slides',
  reel: '{"duration":"30s","beats":[{"time":"0-3s","visual":"...","voiceover":"..."}]} — 4-5 beats',
  video: '{"duration":"60-90s","sections":[{"label":"Hook/Setup/Value/CTA","script":"..."}]}',
  blog: '{"title":"SEO title","meta":"155 char meta","outline":["H2 sections"],"intro":"2 paragraphs","keywords":["8"]}',
  email: '{"emails":[{"day":1,"subject":"...","preview":"...","body":"short email with \\n"}]} — 3 emails',
  linkedin: '{"hook":"first line","body":"article with \\n breaks, 200-300 words","hashtags":["5"]}',
  product: '{"headline":"...","description":"120 words","bullets":["5 benefit bullets"],"seo_title":"..."}',
  press: '{"headline":"...","subhead":"...","dateline":"CITY, Date —","body":"3 paragraphs with \\n","boilerplate":"..."}',
  adcopy: '{"variants":[{"platform":"Meta/Google","headline":"...","primary":"...","cta":"..."}]} — 4 variants',
  landing: '{"hero":{"headline":"...","sub":"...","cta":"..."},"sections":[{"title":"...","copy":"..."}],"faq":[{"q":"...","a":"..."}]}',
  podcast: '{"title":"...","intro":"...","segments":[{"name":"...","talking_points":["..."]}],"outro":"..."}',
  newsletter: '{"subject":"...","sections":[{"heading":"...","copy":"..."}],"cta":"..."}',
  seo: '{"primary_keyword":"...","secondary":["6"],"title_tag":"...","meta":"...","h_structure":["H1/H2s"],"faq":[{"q":"...","a":"..."}]}',
};

export async function POST(req: NextRequest) {
  try {
    const { type, brief, brand } = await req.json();
    if (!SCHEMAS[type]) return NextResponse.json({ error: 'Unknown content type' }, { status: 400 });

    const brandCtx = brand ? `\nBRAND KIT (follow strictly): tone="${brand.tone||''}", taglines="${brand.taglines||''}", guidelines="${brand.guidelines||''}", colors=${JSON.stringify(brand.colors||[])}` : '';
    const system = `You are Zelvoo, the most advanced AI content engine. Produce immediately usable, platform-native marketing content. Zero fluff.${brandCtx}
BRIEF: Brand: ${brief.brand} | Industry: ${brief.industry} | Audience: ${brief.audience} | Tone: ${brief.tone} | Platform: ${brief.platform} | Focus: ${brief.focus||'brand growth'}
Respond ONLY with valid minified JSON. No fences, no preamble.`;

    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6', max_tokens: 2500, system,
      messages: [{ role: 'user', content: `Generate "${type}" in exactly this schema: ${SCHEMAS[type]}` }],
    });
    const text = msg.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('');
    const clean = text.replace(/```json|```/g, '').trim();
    const data = JSON.parse(clean.slice(clean.indexOf('{'), clean.lastIndexOf('}') + 1));
    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
