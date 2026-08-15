'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import MarketingNav from '@/components/MarketingNav';
import { Icon } from '@/components/Icon';
import { PLANS } from '@/lib/plans';
import { localCurrency, formatLocal } from '@/lib/currency';
import AppImage from '@/components/AppImage';
import { MARKETING_IMAGES } from '@/lib/marketing-images';

const ICON: Record<string, string> = {
  weekly: 'bolt', starter: 'spa', pro: 'rocket_launch', studio: 'apartment',
  agency: 'workspace_premium', enterprise: 'diamond',
};

export default function Pricing() {
  const order = ['weekly','starter','pro','studio','agency','enterprise'] as const;
  const [cur, setCur] = useState<any>(null);
  useEffect(() => { localCurrency().then(setCur); }, []);

  return (
    <div className="section-light min-h-screen">
      <div className="orb-fixed-light animate-orb" />
      <MarketingNav />
      <main className="max-w-6xl mx-auto px-5 py-16 md:py-20 animate-rise">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <p className="eyebrow mb-4">Flexible Pricing</p>
          <h1 className="font-heading text-hero text-rich-black">
            Plans that scale with your <span className="grad-text">ambition</span>
          </h1>
          <p className="text-center text-stone mt-4 text-body-lg">
            Free 7-day trial · 50 credits · No card required · All text tools included · Pay with card, MTN MoMo, Telecel Cash, AirtelTigo or bank transfer.
          </p>
        </div>

        <section className="mb-10">
          <AppImage
            src={MARKETING_IMAGES.pricingOwner}
            alt="Small business owner reviewing marketing performance on a laptop"
            width={1400}
            height={840}
            sizes="(max-width: 1024px) 100vw, 980px"
          />
        </section>

        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-3 mb-9">
          {[
            ['Fastest Setup', 'Go live in minutes with AI-ready workflows'],
            ['Local Payments', 'MoMo, bank transfer and cards supported'],
            ['Credit Control', 'Predictable usage with clear output costing'],
          ].map(([title, desc]) => (
            <div key={title} className="glass-card-light p-4 text-center">
              <p className="text-sm font-medium text-rich-black">{title}</p>
              <p className="text-xs text-stone mt-1">{desc}</p>
            </div>
          ))}
        </div>

        {cur && cur.code !== 'USD' && (
          <p className="text-center text-[12px] text-stone mb-8">Showing approximate {cur.code} prices for {cur.country} · billed in USD via Flutterwave.</p>
        )}
        {(!cur || cur.code === 'USD') && <div className="mb-8" />}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
          {order.map(k => { const p = PLANS[k]; const ent = k === 'enterprise';
            const weeklyAccent = k === 'weekly' || k === 'starter' || k === 'pro';
            const unit = p.days <= 7 ? '' : '/mo';
            const perDollar = p.price > 0 ? (p.credits / p.price).toFixed(1) : null;
            const isFeatured = p.popular || ent;
            const localPrice = cur && cur.code !== 'USD' ? formatLocal(p.price, cur) : null;
            return (
              <div key={k} className={`rounded-3xl p-6 relative transition-all duration-200 hover:-translate-y-0.5 ${isFeatured ? 'section-dark ring-1 ring-caribbean-green/50 shadow-glow' : 'glass-card-light glass-highlight hover:border-caribbean-green/45'}`}>
                {p.popular && <span className="badge-popular">Most popular</span>}
                <div className={`mb-3 inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium ${isFeatured ? 'border-mountain-meadow/30 bg-bangladesh-green/20 text-anti-flash-white' : 'border-bangladesh-green/20 bg-white text-bangladesh-green'}`}>
                  {ent ? 'Unlimited Scale' : `${p.credits.toLocaleString()} credits`}
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Icon name={ICON[k]} className={isFeatured ? 'text-caribbean-green' : 'text-mountain-meadow'} />
                  <div
                    className={`font-heading font-semibold text-lg ${isFeatured ? 'text-anti-flash-white' : 'text-rich-black'}`}
                    style={weeklyAccent || ent ? { color: '#00DF81' } : undefined}
                  >
                    {p.name}
                  </div>
                </div>
                <div
                  className={`text-[11px] mb-3 ${isFeatured ? 'feature-dim' : 'text-stone'}`}
                  style={weeklyAccent || ent ? { color: '#00DF81' } : undefined}
                >
                  {p.tagline}
                </div>
                <div className="mb-1">{p.price >= 0
                  ? <div className="space-y-1">
                      <div>
                        <span
                          className={`font-heading font-semibold text-4xl ${isFeatured ? 'text-anti-flash-white' : 'text-rich-black'}`}
                          style={weeklyAccent ? { color: '#00DF81' } : undefined}
                        >
                          {localPrice ? localPrice.split('  ·  ')[0] : `$${p.price}`}
                        </span>
                        <span
                          className={`text-xs ${isFeatured ? 'feature-dim' : 'text-stone'}`}
                          style={weeklyAccent ? { color: '#00DF81' } : undefined}
                        >
                          {unit}
                        </span>
                      </div>
                      {localPrice && (
                        <div className="text-[11px] text-stone" style={weeklyAccent ? { color: '#00DF81' } : undefined}>
                          {localPrice.split('  ·  ')[1]}
                        </div>
                      )}
                    </div>
                  : <span className={`font-heading font-semibold text-xl ${isFeatured ? 'text-anti-flash-white' : 'text-rich-black'}`} style={ent ? { color: '#00DF81' } : undefined}>Custom</span>}</div>
                {cur && cur.code !== 'USD' && p.price > 0 &&
                  <div className={`text-[11px] mb-1 ${isFeatured ? 'feature-dim' : 'text-stone'}`} style={weeklyAccent ? { color: '#00DF81' } : undefined}>≈ {cur.symbol}{Math.round(p.price * cur.rate).toLocaleString()} {cur.code}</div>}
                {perDollar && <div className={`text-[10px] mb-3 ${isFeatured ? 'feature-dim' : 'text-stone'}`}>{perDollar} credits / $</div>}
                {(!perDollar) && <div className="mb-3" />}
                <div className={`h-px mb-3 ${isFeatured ? 'bg-feature-border' : 'bg-bangladesh-green/20'}`} />
                <ul className="space-y-1.5 min-h-[150px] text-[12.5px]">
                  {p.perks.map((x: string) => (
                    <li key={x} className="flex gap-2">
                      <Icon name="check" className="text-caribbean-green" />
                      <span className={isFeatured ? 'feature-muted' : 'text-stone'}>{x}</span>
                    </li>
                  ))}
                </ul>
                <Link href={ent ? '/contact' : `/signup?plan=${k}`}
                  className={`block text-center rounded-full py-3 mt-5 font-heading font-medium text-[13px] transition hover:-translate-y-0.5 ${
                    isFeatured ? 'bg-caribbean-green text-rich-black hover:brightness-110' : 'bg-white text-bangladesh-green border border-bangladesh-green/20 hover:border-caribbean-green/45'}`}>
                  {ent ? 'Contact sales' : p.days <= 7 ? `Get ${p.credits.toLocaleString()} credits` : 'Start free'}
                </Link>
              </div>
            ); })}
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-4">
          <div className="glass-card-light p-5">
            <p className="eyebrow mb-2">How Credits Work</p>
            <p className="text-[12px] text-rich-black">1 credit = 1 content generation. Saving a Creative Studio design uses 4 credits. Credits refresh each billing period.</p>
          </div>
          <div className="glass-card-light p-5">
            <p className="eyebrow mb-2">Need A Team Setup?</p>
            <p className="text-[12px] text-rich-black">Studio and Agency plans include seats, approval workflows and client collaboration. Enterprise unlocks custom infrastructure and SLA support.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
