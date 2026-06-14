import Link from 'next/link';
import MarketingNav from '@/components/MarketingNav';
import { PLANS } from '@/lib/plans';

export default function Pricing() {
  const order = ['starter','pro','studio','agency','enterprise'] as const;
  return (
    <>
      <MarketingNav />
      <main className="max-w-6xl mx-auto px-5 py-14 animate-rise">
        <h1 className="font-sora font-extrabold text-4xl text-center">Plans that scale with your <span className="grad-text">ambition</span></h1>
        <p className="text-center text-slate-500 mt-3 mb-10">7-day free trial on every plan · Pay with card, MTN MoMo, Telecel Cash, AirtelTigo or bank transfer.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
          {order.map(k => { const p = PLANS[k]; const ent = k === 'enterprise';
            return (
              <div key={k} className={`rounded-3xl p-6 relative ${p.popular ? 'border-2 border-primary shadow-glow scale-[1.03] bg-white dark:bg-white/5' : ent ? 'bg-ink text-white' : 'glass'}`}>
                {p.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-secondary to-primary text-white font-mono text-[9px] font-bold tracking-widest rounded-full px-3 py-1">⭐ MOST POPULAR</span>}
                <div className="font-sora font-extrabold text-lg">{p.name}</div>
                <div className={`text-[11px] mb-3 ${ent ? 'text-indigo-300' : 'text-slate-500'}`}>{p.tagline}</div>
                <div className="mb-4">{p.price >= 0
                  ? <><span className="font-sora font-extrabold text-3xl">${p.price}</span><span className="text-xs text-slate-400">/mo</span></>
                  : <span className="font-sora font-extrabold text-xl">Custom</span>}</div>
                <ul className="space-y-1.5 min-h-[150px] text-[12.5px]">
                  {p.perks.map((x: string) => <li key={x} className="flex gap-2"><span className="text-success font-bold">✓</span><span className={ent ? 'text-indigo-100' : ''}>{x}</span></li>)}
                </ul>
                <Link href={ent ? '/contact' : `/signup?plan=${k}`}
                  className={`block text-center rounded-full py-3 mt-4 font-sora font-bold text-[13px] ${p.popular ? 'cta' : ent ? 'bg-white text-ink' : 'bg-slate-100 dark:bg-white/10'}`}>
                  {ent ? 'Contact sales' : 'Start free trial'}
                </Link>
              </div>
            ); })}
        </div>
      </main>
    </>
  );
}
