import { planCredits, PLANS } from '@/lib/plans';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

/** Flutterwave webhook — set URL in FLW Dashboard -> Settings -> Webhooks.
    Handles: charge.completed (payment.successful/failed), subscription.cancelled */
export async function POST(req: NextRequest) {
  const sig = req.headers.get('verif-hash');
  if (!sig || sig !== process.env.FLW_WEBHOOK_HASH)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });

  const event = await req.json();
  const db = supabaseAdmin();
  const data = event.data || {};
  const meta = data.meta || {};
  const userId = meta.userId, plan = meta.plan;

  // log raw transaction
  const { data: pay } = await db.from('payments').upsert({
    user_id: userId || null, amount: data.amount, currency: data.currency, plan,
    flw_tx_id: String(data.id || ''), flw_tx_ref: data.tx_ref,
    status: data.status === 'successful' ? 'successful' : 'failed',
    method: data.payment_type,
  }, { onConflict: 'flw_tx_ref' }).select().single();
  if (pay) await db.from('transactions').insert({ payment_id: pay.id, raw: event });

  if ((event.event === 'charge.completed' || event['event.type'] === 'CARD_TRANSACTION') && data.status === 'successful' && userId && plan) {
    const days = PLANS[plan as keyof typeof PLANS]?.days ?? 30;
    const periodEnd = new Date(Date.now() + days * 86400000).toISOString();
    await db.from('subscriptions').upsert(
      { user_id: userId, plan, status: 'active', flw_tx_ref: data.tx_ref, current_period_end: periodEnd, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' } as any);
    await db.from('profiles').update({ plan, credits: planCredits(plan), credits_period_start: new Date().toISOString(), plan_started_at: new Date().toISOString() }).eq('id', userId);
    await db.from('credit_log').insert({ user_id: userId, delta: planCredits(plan), balance_after: planCredits(plan), reason: `${plan.charAt(0).toUpperCase()}${plan.slice(1)} plan purchased` });
    if (pay) await db.from('invoices').insert({ user_id: userId, payment_id: pay.id, amount: data.amount, currency: data.currency, plan });
  }

  if (event.event === 'subscription.cancelled' && userId) {
    await db.from('subscriptions').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('user_id', userId);
  }
  return NextResponse.json({ received: true });
}
