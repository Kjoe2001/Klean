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
    const res = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tx_ref,
        amount: localAmount,
        currency: cur.code,
        redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success`,
        customer: { email },
        customizations: {
          title: 'Zelvoo',
          description: `${p.name} — ${periodLabel}, ${p.credits.toLocaleString()} credits`,
          logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
        },
        payment_options: 'card,mobilemoneyghana,banktransfer,ussd',
        meta: { userId, plan, country: profile?.country || 'US', localAmount },
      }),
    });
    const data = await res.json();
    if (data.status !== 'success') return NextResponse.json({ error: data.message }, { status: 400 });
    return NextResponse.json({ link: data.data.link, tx_ref });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
