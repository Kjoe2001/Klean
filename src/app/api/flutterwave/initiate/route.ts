import { NextRequest, NextResponse } from 'next/server';
import { PLANS } from '@/lib/plans';

export async function POST(req: NextRequest) {
  try {
    const { plan, email, userId } = await req.json();
    const p = PLANS[plan as keyof typeof PLANS];
    if (!p || p.price <= 0) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

    const tx_ref = `zelvoo-${plan}-${userId}-${Date.now()}`;
    const res = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tx_ref,
        amount: p.price,
        currency: 'USD',
        redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success`,
        customer: { email },
        customizations: { title: 'Zelvoo', description: `${p.name} plan — monthly`, logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png` },
        payment_options: 'card,mobilemoneyghana,banktransfer,ussd',
        meta: { userId, plan },
      }),
    });
    const data = await res.json();
    if (data.status !== 'success') return NextResponse.json({ error: data.message }, { status: 400 });
    return NextResponse.json({ link: data.data.link, tx_ref });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
