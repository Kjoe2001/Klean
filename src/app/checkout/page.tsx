'use client';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useProfile } from '@/components/useProfile';
import { PLANS } from '@/lib/plans';
import Logo from '@/components/Logo';

function Checkout() {
  const params = useSearchParams();
  const planKey = (params.get('plan') || 'pro') as keyof typeof PLANS;
  const plan = PLANS[planKey];
  const { profile } = useProfile();
  const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  if (!profile || !plan || plan.price <= 0) return null;

  const pay = async () => {
    setBusy(true); setErr('');
    try {
      const r = await fetch('/api/flutterwave/initiate', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey, email: profile.email, userId: profile.id }) });
      const j = await r.json();
      if (j.error) throw new Error(j.error);
      location.href = j.link;            // → Flutterwave hosted checkout
    } catch (e: any) { setErr(e.message); setBusy(false); }
  };

  return (
    <div className="min-h-screen grid place-items-center p-5">
      <div className="glass w-full max-w-md p-9 animate-rise">
        <div className="flex justify-center mb-6"><Logo /></div>
        <h1 className="font-sora font-extrabold text-xl text-center">Checkout</h1>
        <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-5 my-6">
          <div className="flex justify-between font-sora font-bold"><span>{plan.name} plan</span><span>${plan.price}/mo</span></div>
          <ul className="mt-3 space-y-1 text-[12.5px] text-slate-500">{plan.perks.slice(0, 4).map((p: string) => <li key={p}>✓ {p}</li>)}</ul>
        </div>
        <button className="cta w-full py-4 text-[15px]" disabled={busy} onClick={pay}>
          {busy ? 'Opening secure checkout…' : `Pay $${plan.price} securely →`}
        </button>
        {err && <p className="text-rose-500 text-xs mt-3 text-center">{err}</p>}
        <p className="text-[11px] text-slate-400 text-center mt-4">
          Powered by Flutterwave 🔒 Visa · Mastercard · MTN MoMo · Telecel Cash · AirtelTigo · Bank Transfer
        </p>
      </div>
    </div>
  );
}
export default function Page() { return <Suspense><Checkout /></Suspense>; }
