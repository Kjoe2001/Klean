import { planCredits } from '@/lib/plans';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

/** Called from /payment-success with ?transaction_id= — verifies with FLW and activates plan immediately. */
export async function POST(req: NextRequest) {
  try {
    const { transaction_id } = await req.json();
    const res = await fetch(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {
      headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` },
    });
    const out = await res.json();
    const d = out.data;
    if (out.status === 'success' && d.status === 'successful') {
      const { userId, plan } = d.meta || {};
      if (userId && plan) {
        const db = supabaseAdmin();
        await db.from('profiles').update({ plan, credits: planCredits(plan), credits_period_start: new Date().toISOString(), plan_started_at: new Date().toISOString() }).eq('id', userId);
    await db.from('credit_log').insert({ user_id: userId, delta: planCredits(plan), balance_after: planCredits(plan), reason: `${plan.charAt(0).toUpperCase()}${plan.slice(1)} plan purchased` });
        await db.from('subscriptions').upsert({ user_id: userId, plan, status: 'active', flw_tx_ref: d.tx_ref,
          current_period_end: new Date(Date.now() + 30*86400000).toISOString() }, { onConflict: 'user_id' } as any);
      }
      return NextResponse.json({ ok: true, plan: d.meta?.plan });
    }
    return NextResponse.json({ ok: false, error: 'Not successful' }, { status: 400 });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
