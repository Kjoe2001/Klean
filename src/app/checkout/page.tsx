'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Script from 'next/script';
import { useProfile } from '@/components/useProfile';
import { PLANS } from '@/lib/plans';
import Logo from '@/components/Logo';
import Button from '@/components/ui/Button';
import { currencyForCountry, formatLocal, localCurrency } from '@/lib/currency';

declare global {
  interface Window {
    FlutterwaveCheckout?: (opts: Record<string, any>) => void;
  }
}

function Checkout() {
  const params = useSearchParams();
  const router = useRouter();
  const planKey = (params.get('plan') || 'pro') as keyof typeof PLANS;
  const plan = PLANS[planKey];
  const { profile } = useProfile();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [cur, setCur] = useState<any>(null);
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => { (async () => {
    if (profile?.country) { setCur(currencyForCountry(profile.country)); return; }
    setCur(await localCurrency());
  })(); }, [profile?.country]);

  if (!profile || !plan || plan.price <= 0) return null;
  const periodUnit = plan.days <= 7 ? '/week' : '/mo';

  const pay = async () => {
    setBusy(true); setErr('');
    try {
      const r = await fetch('/api/flutterwave/initiate', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey, email: profile.email, userId: profile.id }) });
      const j = await r.json();
      if (j.error) throw new Error(j.error);

      if (!sdkReady || !window.FlutterwaveCheckout) throw new Error('Payment is still loading — try again in a moment.');

      window.FlutterwaveCheckout({
        public_key: process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY,
        tx_ref: j.tx_ref,
        amount: j.amount,
        currency: j.currency,
        payment_options: 'card,mobilemoneyghana,banktransfer,ussd',
        customer: { email: profile.email, name: profile.name },
        customizations: {
          title: 'Zelvoo',
          description: j.description,
          logo: `${window.location.origin}/icon.svg`,
        },
        meta: j.meta,
        callback: (response: any) => {
          router.push(`/payment-success?transaction_id=${response.transaction_id}`);
        },
        onclose: () => setBusy(false),
      });
    } catch (e: any) { setErr(e.message); setBusy(false); }
  };

  return (
    <>
      <Script src="https://checkout.flutterwave.com/v3.js" strategy="afterInteractive" onLoad={() => setSdkReady(true)} />
      <div className="section-light min-h-screen grid place-items-center p-5 relative">
        <div className="orb-fixed-light animate-orb" />
        <div className="glass-card-light glass-highlight w-full max-w-md p-9 animate-rise relative z-10">
          <div className="flex justify-center mb-6"><Logo darkText /></div>
          <h1 className="font-heading font-semibold text-xl text-center text-rich-black">Checkout</h1>
          <div className="bg-bangladesh-green/5 border border-bangladesh-green/10 rounded-[16px] p-5 my-6">
            <div className="flex justify-between font-heading font-semibold text-rich-black gap-3">
              <span>{plan.name} plan</span>
              <span>{cur ? formatLocal(plan.price, cur).split('  ·  ')[0] : `$${plan.price}`}{periodUnit}</span>
            </div>
            {cur && cur.code !== 'USD' && <div className="mt-1 text-[11px] text-stone">{formatLocal(plan.price, cur).split('  ·  ')[1]}</div>}
            <ul className="mt-3 space-y-1 text-[12.5px] text-stone">
              {plan.perks.slice(0, 4).map((p: string) => <li key={p}>✓ {p}</li>)}
            </ul>
          </div>
          <Button className="w-full" size="lg" disabled={busy} onClick={pay}>
            {busy ? 'Opening secure checkout…' : `Pay ${cur ? formatLocal(plan.price, cur).split('  ·  ')[0] : `$${plan.price}`} securely →`}
          </Button>
          {err && <p className="text-danger text-xs mt-3 text-center">{err}</p>}
          <p className="text-[11px] text-stone text-center mt-4">
            Secured by Flutterwave 🔒 Visa · Mastercard · MTN MoMo · Telecel Cash · AirtelTigo · Bank Transfer
          </p>
        </div>
      </div>
    </>
  );
}
export default function Page() { return <Suspense><Checkout /></Suspense>; }
