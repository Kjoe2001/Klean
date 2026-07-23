import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { SUPPORT_FAQ } from '@/lib/journey';
import { PLANS } from '@/lib/plans';

export const maxDuration = 30;

const MAX_MESSAGE_LEN = 2000;
const MAX_HISTORY = 20;
const HUMAN_REQUEST = /\b(human|real person|representative|speak (to|with) (a |an )?(person|someone|agent)|talk to (a |an )?(person|someone|agent))\b/i;

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

async function parseChatJson(client: Anthropic, text: string) {
  let candidate = extractJsonCandidate(text);
  try {
    return JSON.parse(candidate);
  } catch {
    const repair = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      system: 'Fix malformed JSON only. Return valid minified JSON and nothing else.',
      messages: [{ role: 'user', content: `Repair this to valid JSON for schema: {"reply":"string","escalate":boolean}\n\nRAW OUTPUT:\n${candidate}` }],
    });
    const fixed = repair.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('');
    candidate = extractJsonCandidate(fixed);
    return JSON.parse(candidate);
  }
}

function buildSystemPrompt() {
  const faq = SUPPORT_FAQ.map(f => `Q: ${f.q}\nA: ${f.a}`).join('\n\n');
  const plans = Object.entries(PLANS)
    .map(([key, p]: [string, any]) => `${p.name} (${key}): ${p.price <= 0 ? 'Free' : `$${p.price}`}, ${p.credits >= 999999 ? 'unlimited' : p.credits.toLocaleString()} credits, ${p.tagline}`)
    .join('\n');

  return `You are Zelvoo's friendly live chat assistant. Zelvoo is Africa's AI Marketing Operating System — an AI platform for brands and agencies that generates content, campaigns, competitor intel, and client-ready reports from one brief.

Answer questions using ONLY the FAQ and plan info below. Be warm, concise (2-4 sentences), and on-brand. If you don't know the answer from this context, say so honestly rather than guessing, and set escalate to true.

FAQ:
${faq}

PLANS:
${plans}

Respond ONLY with strict minified JSON matching this schema, nothing else:
{"reply": "your response to the user", "escalate": true or false}

Set escalate to true if: the user explicitly asks for a human/real person/agent, you cannot confidently answer their question from the context above, or they seem frustrated and need direct help. Otherwise false.`;
}

async function sendEscalationEmail(transcript: string, visitorEmail: string | undefined, pageUrl: string | undefined) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const from = process.env.WELCOME_EMAIL_FROM || 'Zelvoo <no-reply@zelvoo.app>';

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f4f7f6;padding:24px;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #dbe7e3;">
      <div style="background:#022e28;padding:20px 24px;color:#00df81;font-weight:700;font-size:20px;">Live chat — human requested</div>
      <div style="padding:24px;color:#14312b;line-height:1.6;font-size:14px;">
        <p style="margin:0 0 12px;"><b>Visitor email:</b> ${visitorEmail || 'not provided'}</p>
        <p style="margin:0 0 16px;"><b>Page:</b> ${pageUrl || 'unknown'}</p>
        <p style="margin:0 0 8px;font-weight:700;">Transcript:</p>
        <pre style="white-space:pre-wrap;font-family:inherit;background:#f4f7f6;border-radius:8px;padding:12px;margin:0;">${transcript}</pre>
      </div>
    </div>
  </div>`;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: ['hello@zelvoo.app'],
      ...(visitorEmail ? { reply_to: visitorEmail } : {}),
      subject: 'Live chat — human requested',
      html,
    }),
  }).catch(() => {});
}

export async function POST(req: NextRequest) {
  try {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) return NextResponse.json({ error: 'Chat is not configured.' }, { status: 500 });

    const { messages, visitorEmail, pageUrl, forceEscalate } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages is required' }, { status: 400 });
    }

    const trimmed: { role: 'user' | 'assistant'; content: string }[] = messages
      .slice(-MAX_HISTORY)
      .map((m: any) => ({
        role: m.role === 'assistant' ? 'assistant' as const : 'user' as const,
        content: String(m.content || '').slice(0, MAX_MESSAGE_LEN),
      }));

    // The widget calls this again with forceEscalate once the visitor has
    // supplied their email after an earlier turn already triggered escalation —
    // send the notification directly rather than re-running Claude (a message
    // that's just an email address wouldn't itself trigger escalate=true).
    if (forceEscalate) {
      const transcript = trimmed.map((m: { role: string; content: string }) => `${m.role === 'user' ? 'Visitor' : 'Zelvoo bot'}: ${m.content}`).join('\n\n');
      await sendEscalationEmail(transcript, visitorEmail, pageUrl);
      return NextResponse.json({ reply: '', escalated: true });
    }

    const lastUserMessage = [...trimmed].reverse().find(m => m.role === 'user')?.content || '';
    const explicitHumanRequest = HUMAN_REQUEST.test(lastUserMessage);

    const client = new Anthropic({ apiKey: key });
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      system: buildSystemPrompt(),
      messages: trimmed,
    });
    const text = msg.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('');

    let data: { reply: string; escalate: boolean };
    try {
      data = await parseChatJson(client, text);
    } catch {
      data = { reply: "Sorry, I didn't quite catch that — could you rephrase?", escalate: false };
    }

    const escalated = explicitHumanRequest || data.escalate === true;

    if (escalated) {
      const transcript = [...trimmed, { role: 'assistant', content: data.reply }]
        .map(m => `${m.role === 'user' ? 'Visitor' : 'Zelvoo bot'}: ${m.content}`)
        .join('\n\n');
      await sendEscalationEmail(transcript, visitorEmail, pageUrl);
    }

    return NextResponse.json({ reply: data.reply, escalated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
