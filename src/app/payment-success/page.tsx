'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

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
    <div className="min-h-screen grid place-items-center p-5">
      <div className="glass w-full max-w-md p-10 text-center animate-rise">
        {state === 'verifying' && <><div className="w-10 h-10 mx-auto rounded-full border-4 border-primary border-t-transparent animate-spin" /><p className="mt-4 text-sm text-slate-500">Verifying your payment…</p></>}
        {state === 'ok' && <>
          <div className="text-5xl mb-3">🎉</div>
          <h1 className="font-sora font-extrabold text-xl">Payment successful!</h1>
          <p className="text-sm text-slate-500 mt-2">Your {plan && <b className="capitalize">{plan} </b>}plan is active. Welcome to the full Zelvoo.</p>
          <Link href="/dashboard" className="cta inline-block px-8 py-3.5 text-sm mt-6">Go to dashboard →</Link></>}
        {state === 'fail' && <>
          <div className="text-5xl mb-3">😕</div>
          <h1 className="font-sora font-extrabold text-xl">We couldn't verify that payment</h1>
          <Link href="/payment-failed" className="pill inline-block mt-5">What now?</Link></>}
      </div>
    </div>
  );
}
export default function Page() { return <Suspense><Success /></Suspense>; }
