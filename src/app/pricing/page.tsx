'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import MarketingNav from '@/components/MarketingNav';
import { Icon } from '@/components/Icon';
import { PLANS } from '@/lib/plans';
import { localCurrency } from '@/lib/currency';

const ICON: Record<string, string> = {
  weekly: 'bolt', starter: 'spa', pro: 'rocket_launch', studio: 'apartment',
  agency: 'workspace_premium', enterprise: 'diamond',
};

export default function Pricing() {
  const order = ['weekly','starter','pro','studio','agency','enterprise'] as const;
  const [cur, setCur] = useState<any>(null);
  useEffect(() => { localCurrency().then(setCur); }, []);

  return (
    <>
      <MarketingNav />
      <main className="max-w-6xl mx-auto px-5 py-14 animate-rise">
        <h1 className="font-sora font-extrabold text-4xl text-center">Plans that scale with your <span className="grad-text">ambition</span></h1>
        <p className="text-center text-slate-500 mt-3 mb-2">Free 7-day trial · 30 credits · No card required · Pay with card, MTN MoMo, Telecel Cash, AirtelTigo or bank transfer.</p>
        {cur && cur.code !== 'USD' && (
          <p className="text-center text-[12px] text-slate-400 mb-8">Showing approximate {cur.code} prices for {cur.country} · billed in USD via Flutterwave.</p>
        )}
        {(!cur || cur.code === 'USD') && <div className="mb-8" />}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
          {order.map(k => { const p = PLANS[k]; const ent = k === 'enterprise';
            const unit = k === 'weekly' ? '/week' : '/mo';
            const perDollar = p.price > 0 ? (p.credits / p.price).toFixed(1) : null;
            const isFeatured = p.popular || ent;
            return (
              <div key={k} className={`rounded-3xl p-6 relative ${isFeatured ? 'feature-card' : 'glass'}`}>
                {p.popular && <span className="badge-popular">Most popular</span>}
                <div className="flex items-center gap-2 mb-1">
                  <Icon name={ICON[k]} className={isFeatured ? 'text-feature-muted' : 'text-slate-400'} />
                  <div className={`font-sora font-extrabold text-lg ${isFeatured ? 'text-white' : ''}`}>{p.name}</div>
                </div>
                <div className={`text-[11px] mb-3 ${isFeatured ? 'feature-dim' : 'text-slate-500'}`}>{p.tagline}</div>
                <div className="mb-1">{p.price >= 0
                  ? <><span className={`font-sora font-extrabold text-3xl ${isFeatured ? 'text-white' : ''}`}>${p.price}</span><span className={`text-xs ${isFeatured ? 'feature-dim' : 'text-slate-400'}`}>{unit}</span></>
                  : <span className="font-sora font-extrabold text-xl text-white">Custom</span>}</div>
                {cur && cur.code !== 'USD' && p.price > 0 &&
                  <div className={`text-[11px] mb-1 ${isFeatured ? 'feature-dim' : 'text-slate-400'}`}>≈ {cur.symbol}{Math.round(p.price * cur.rate).toLocaleString()} {cur.code}</div>}
                {perDollar && <div className={`text-[10px] mb-3 ${isFeatured ? 'feature-dim' : 'text-slate-400'}`}>{perDollar} credits / $</div>}
                {(!perDollar) && <div className="mb-3" />}
                <div className={`h-px mb-3 ${isFeatured ? 'bg-feature-border' : 'bg-slate-200 dark:bg-white/10'}`} />
                <ul className="space-y-1.5 min-h-[150px] text-[12.5px]">
                  {p.perks.map((x: string) => (
                    <li key={x} className="flex gap-2">
                      <Icon name="check" className={isFeatured ? 'text-secondary' : 'text-success'} />
                      <span className={isFeatured ? 'feature-muted' : ''}>{x}</span>
                    </li>
                  ))}
                </ul>
                <Link href={ent ? '/contact' : `/signup?plan=${k}`}
                  className={`block text-center rounded-full py-3 mt-4 font-sora font-bold text-[13px] transition hover:-translate-y-0.5 ${
                    isFeatured ? 'bg-brand-gradient text-white' : 'bg-slate-100 dark:bg-white/10'}`}>
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
