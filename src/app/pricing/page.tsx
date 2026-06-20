'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import MarketingNav from '@/components/MarketingNav';
import { PLANS } from '@/lib/plans';
import { localCurrency, formatLocal } from '@/lib/currency';

export default function Pricing() {
  const order = ['weekly','starter','pro','studio','agency','enterprise'] as const;
  const [cur, setCur] = useState<any>(null);
  useEffect(() => { localCurrency().then(setCur); }, []);

  return (
    <>
      <MarketingNav />
      <main className="max-w-6xl mx-auto px-5 py-14 animate-rise">
        <h1 className="font-sora font-extrabold text-4xl text-center">Plans that scale with your <span className="grad-text">ambition</span></h1>
        <p className="text-center text-slate-500 mt-3 mb-2">Start free with 30 credits · Pay with card, MTN MoMo, Telecel Cash, AirtelTigo or bank transfer.</p>
        {cur && cur.code !== 'USD' && (
          <p className="text-center text-[12px] text-slate-400 mb-8">Showing approximate {cur.code} prices for {cur.country} · billed in USD via Flutterwave.</p>
        )}
        {(!cur || cur.code === 'USD') && <div className="mb-8" />}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
          {order.map(k => { const p = PLANS[k]; const ent = k === 'enterprise';
            const unit = k === 'weekly' ? '/6 days' : '/mo';
            return (
              <div key={k} className={`rounded-3xl p-6 relative ${p.popular ? 'border-2 border-primary shadow-glow scale-[1.02] bg-white dark:bg-white/5' : ent ? 'bg-ink text-white' : 'glass'}`}>
                {p.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-secondary to-primary text-white font-mono text-[9px] font-bold tracking-widest rounded-full px-3 py-1">⭐ BEST FOR STARTERS</span>}
                <div className="font-sora font-extrabold text-lg">{p.name}</div>
                <div className={`text-[11px] mb-3 ${ent ? 'text-indigo-300' : 'text-slate-500'}`}>{p.tagline}</div>
                <div className="mb-1">{p.price >= 0
                  ? <><span className="font-sora font-extrabold text-3xl">${p.price}</span><span className="text-xs text-slate-400">{unit}</span></>
                  : <span className="font-sora font-extrabold text-xl">Custom</span>}</div>
                {cur && cur.code !== 'USD' && p.price > 0 &&
                  <div className="text-[11px] text-slate-400 mb-3">≈ {cur.symbol}{Math.round(p.price * cur.rate).toLocaleString()} {cur.code}</div>}
                {(!cur || cur.code === 'USD' || p.price <= 0) && <div className="mb-3" />}
                <ul className="space-y-1.5 min-h-[150px] text-[12.5px]">
                  {p.perks.map((x: string) => <li key={x} className="flex gap-2"><span className="text-success font-bold">✓</span><span className={ent ? 'text-indigo-100' : ''}>{x}</span></li>)}
                </ul>
                <Link href={ent ? '/contact' : `/signup?plan=${k}`}
                  className={`block text-center rounded-full py-3 mt-4 font-sora font-bold text-[13px] ${p.popular ? 'cta' : ent ? 'bg-white text-ink' : 'bg-slate-100 dark:bg-white/10'}`}>
                  {ent ? 'Contact sales' : k === 'weekly' ? 'Get 150 credits' : 'Start free'}
                </Link>
              </div>
            ); })}
        </div>
        <p className="text-center text-[12px] text-slate-400 mt-8">All plans are credit-based. 1 credit = 1 content generation · images cost 3 credits. Credits refresh each billing period.</p>
      </main>
    </>
  );
}
