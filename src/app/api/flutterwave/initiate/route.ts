import { NextRequest, NextResponse } from 'next/server';
import { PLANS } from '@/lib/plans';
import { currencyForCountry } from '@/lib/currency';
import { createClient } from '@supabase/supabase-js';

function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { plan, email, userId } = await req.json();
    const p = PLANS[plan as keyof typeof PLANS];
    if (!p || p.price <= 0) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

    const db = admin();
    const { data: profile } = await db.from('profiles').select('country').eq('id', userId).single();
    const cur = currencyForCountry(profile?.country);
    const localAmount = cur.rate === 1 ? p.price : Math.max(1, Math.round(p.price * cur.rate));

    const tx_ref = `zelvoo-${plan}-${userId}-${Date.now()}`;
    const periodLabel = p.days === 6 ? '6-day access' : p.days === 7 ? '7-day access' : 'monthly';
    const description = `${p.name} — ${periodLabel}, ${p.credits.toLocaleString()} credits`;

    // Params only — the actual charge happens client-side via Flutterwave's inline
    // checkout (FlutterwaveCheckout), which keeps the customer on zelvoo.app instead
    // of redirecting to a hosted Flutterwave page. Amount/currency are computed here,
    // server-side, so the client can't tamper with the price.
    return NextResponse.json({
      tx_ref,
      amount: localAmount,
      currency: cur.code,
      planName: p.name,
      description,
      meta: { userId, plan, country: profile?.country || 'US', localAmount },
    });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
