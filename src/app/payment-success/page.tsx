'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';

function Success() {
  const params = useSearchParams();
  const [state, setState] = useState<'verifying'|'ok'|'fail'>('verifying');
  const [plan, setPlan] = useState('');
  useEffect(() => { (async () => {
    const txId = params.get('transaction_id');
    if (!txId) { setState(params.get('status') === 'successful' ? 'ok' : 'fail'); return; }
    const r = await fetch('/api/flutterwave/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transaction_id: txId }) });
    const j = await r.json();
    if (j.ok) { setPlan(j.plan); setState('ok'); } else setState('fail');
  })(); }, []);
  return (
    <div className="section-light min-h-screen grid place-items-center p-5 relative">
      <div className="orb-fixed-light animate-orb" />
      <div className="glass-card-light glass-highlight w-full max-w-md p-10 text-center animate-rise relative z-10">
        {state === 'verifying' && <>
          <div className="w-10 h-10 mx-auto rounded-full border-4 border-caribbean-green border-t-transparent animate-spin" />
          <p className="mt-4 text-sm text-stone">Verifying your payment…</p>
        </>}
        {state === 'ok' && <>
          <div className="text-5xl mb-3">🎉</div>
          <h1 className="font-heading font-semibold text-xl text-rich-black">Payment successful!</h1>
          <p className="text-sm text-stone mt-2">Your {plan && <b className="capitalize">{plan} </b>}plan is active. Welcome to the full Zelvoo.</p>
          <Link href="/dashboard"><Button className="mt-6">Go to dashboard →</Button></Link>
        </>}
        {state === 'fail' && <>
          <div className="text-5xl mb-3">😕</div>
          <h1 className="font-heading font-semibold text-xl text-rich-black">We couldn&apos;t verify that payment</h1>
          <Link href="/payment-failed"><Button variant="outline" className="mt-5">What now?</Button></Link>
        </>}
      </div>
    </div>
  );
}
export default function Page() { return <Suspense><Success /></Suspense>; }
