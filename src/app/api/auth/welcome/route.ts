import { NextRequest, NextResponse } from 'next/server';

function emailHtml(name: string) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f4f7f6;padding:24px;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #dbe7e3;">
      <div style="background:#022e28;padding:20px 24px;color:#00df81;font-weight:700;font-size:22px;">Welcome to Zelvoo</div>
      <div style="padding:24px;color:#14312b;line-height:1.6;font-size:14px;">
        <p style="margin:0 0 12px;">Hi ${name || 'there'},</p>
        <p style="margin:0 0 12px;">Your account is now confirmed. Welcome to Zelvoo.</p>
        <p style="margin:0 0 10px;font-weight:700;">Your free 7-day trial includes:</p>
        <ul style="margin:0 0 14px 18px;padding:0;">
          <li>50 credits to generate campaign-ready content</li>
          <li>Social posts, ad copy, hooks, and captions from one brief</li>
          <li>Campaign builder with structured planning</li>
          <li>PDF exports for client-ready delivery</li>
          <li>Trend and competitor intelligence tools</li>
        </ul>
        <p style="margin:0 0 12px;">Why teams sign up:</p>
        <ul style="margin:0 0 14px 18px;padding:0;">
          <li>Faster content production with less back-and-forth</li>
          <li>More consistent brand voice across channels</li>
          <li>Cleaner handoff to teammates and clients</li>
        </ul>
        <p style="margin:0;">Log in and create your first campaign in minutes.</p>
      </div>
    </div>
  </div>`;
}

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.WELCOME_EMAIL_FROM || 'Zelvoo <no-reply@zelvoo.app>';

    if (!apiKey) {
      return NextResponse.json({ ok: false, message: 'RESEND_API_KEY not configured' }, { status: 200 });
    }

    const payload = {
      from,
      to: [email],
      subject: 'Welcome to Zelvoo: your 7-day trial is live',
      html: emailHtml(name || ''),
    };

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const text = await r.text();
    if (!r.ok) {
      return NextResponse.json({ ok: false, error: text || 'Failed to send welcome email' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
