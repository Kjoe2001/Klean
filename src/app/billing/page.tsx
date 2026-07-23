'use client';
import { useEffect, useState, Suspense } from 'react';
import AppShell from '@/components/AppShell';
import { useProfile } from '@/components/useProfile';
import { supabase } from '@/lib/supabase';
import { PLANS } from '@/lib/plans';
import { getCredits } from '@/lib/credits';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { currencyForCountry, formatLocal, localCurrency } from '@/lib/currency';

function BillingInner() {
  const { profile } = useProfile();
  const [payments, setPayments] = useState<any[]>([]);
  const [sub, setSub] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const params = useSearchParams();
  const [showHistory, setShowHistory] = useState(params.get('history') === '1');
  const [liveCredits, setLiveCredits] = useState<number | null>(null);
  const [currency, setCurrency] = useState<any>(null);
  useEffect(() => { (async () => {
    const { data: p } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
    setPayments(p || []);
    const { data: s } = await supabase.from('subscriptions').select('*').eq('status', 'active').maybeSingle();
    setSub(s);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      const r = await fetch('/api/credits?history=1', { headers: { Authorization: `Bearer ${session.access_token}` } });
      const j = await r.json();
      setHistory(j.history || []);
    }
    getCredits().then(c => setLiveCredits(c.credits));
  })(); }, []);

  useEffect(() => { (async () => {
    if (profile?.country) { setCurrency(currencyForCountry(profile.country)); return; }
    setCurrency(await localCurrency());
  })(); }, [profile?.country]);

  useEffect(() => {
    const refresh = () => {
      getCredits().then(c => setLiveCredits(c.credits));
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session?.access_token) return;
        fetch('/api/credits?history=1', { headers: { Authorization: `Bearer ${session.access_token}` } })
          .then(r => r.json()).then(j => setHistory(j.history || []));
      });
    };
    window.addEventListener('credits:changed', refresh);
    return () => window.removeEventListener('credits:changed', refresh);
  }, []);
  if (!profile) return null;
  const order = ['weekly','starter','pro','studio','agency','enterprise'] as const;

  return (
    <AppShell title="Billing" subtitle="Plan, payments, invoices — card, MTN MoMo, Telecel Cash, AirtelTigo & bank transfer via Flutterwave.">
      <div className="glass-card-light glass-highlight p-6 mb-5 flex flex-wrap items-center gap-4">
        <div className="flex-1">
          <div className="font-mono text-[10px] font-bold tracking-widest text-bangladesh-green">CURRENT PLAN</div>
          <div className="font-sora font-extrabold text-2xl text-rich-black">{PLANS[profile.plan].name}</div>
          {sub?.current_period_end && <div className="text-xs text-stone">Renews {new Date(sub.current_period_end).toLocaleDateString()}</div>}
        </div>
        <button onClick={() => setShowHistory(s => !s)} className="rounded-full bg-anti-flash-white text-bangladesh-green text-[12.5px] font-sora font-bold px-4 py-2 hover:bg-white transition border border-bangladesh-green/15">
          <span className="mr-1 align-middle">{liveCredits ?? profile.credits ?? 0} credits</span> · {showHistory ? 'Hide' : 'See'} usage
        </button>
        {profile.plan !== 'trial' && (
          <button className="pill !text-rose-500 !bg-white !border-rose-200" onClick={async () => {
            if (!confirm('Cancel subscription? You keep access until the period ends.')) return;
            await supabase.from('subscriptions').update({ status: 'cancelled' }).eq('user_id', profile.id);
            alert('Cancelled — access continues to period end.');
          }}>Cancel subscription</button>)}
      </div>

      {showHistory && (
        <div className="glass-card-light glass-highlight p-5 mb-5 animate-rise">
          <div className="font-sora font-bold text-sm mb-3 flex items-center gap-2">
            <Icon name="receipt_long" className="text-bangladesh-green" />What your credits were used for
          </div>
          {!history.length && <p className="text-stone text-sm">No usage yet — generate something in Content Studio or save a design in Creative Studio and it'll show up here.</p>}
          <div className="space-y-1.5 max-h-80 overflow-y-auto">
            {history.map(h => (
              <div key={h.id} className="flex items-center justify-between text-[13px] py-2 border-b border-bangladesh-green/8 last:border-0">
                <div className="flex items-center gap-2.5">
                  <Icon name={h.delta < 0 ? 'remove_circle' : 'add_circle'} className="text-stone" />
                  <span className="text-rich-black">{h.reason || 'Usage'}</span>
                </div>
                <div className="flex items-center gap-3 text-stone text-[12px]">
                  <span className={h.delta < 0 ? 'text-bangladesh-green font-semibold' : 'text-success font-semibold'}>{h.delta > 0 ? '+' : ''}{h.delta}</span>
                  <span>{new Date(h.created_at).toLocaleDateString()} · {new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-7">
        {order.map(k => { const p = PLANS[k]; const cur = profile.plan === k; const ent = k === 'enterprise';
          const isFeatured = p.popular || ent; const unit = p.days <= 7 ? '/week' : '/mo';
          return (
            <div key={k} className={`rounded-3xl p-5 relative ${isFeatured ? 'feature-card' : 'glass-card-light glass-highlight'}`}>
              {p.popular && <span className="badge-popular">Most popular</span>}
              <div className={`font-sora font-extrabold ${isFeatured ? 'text-white' : 'text-rich-black'}`}>{p.name}</div>
              <div className="my-2">{p.price >= 0
                ? <><span className={`font-sora font-extrabold text-2xl ${isFeatured ? 'text-white' : 'text-rich-black'}`}>{currency ? formatLocal(p.price, currency).split('  ·  ')[0] : `$${p.price}`}</span><span className={`text-xs ${isFeatured ? 'feature-dim' : 'text-stone'}`}>{unit}</span></>
                : <b className={isFeatured ? 'text-white' : 'text-rich-black'}>Custom</b>}</div>
              {currency?.code !== 'USD' && p.price > 0 && <div className={`text-[11px] mb-1 ${isFeatured ? 'feature-dim' : 'text-stone'}`}>{formatLocal(p.price, currency).split('  ·  ')[1]}</div>}
              <div className={`text-[11px] mb-3 ${isFeatured ? 'feature-dim' : 'text-stone'}`}>{p.credits.toLocaleString()} credits</div>
              {ent ? <Link href="/contact" className="block text-center rounded-full py-2.5 text-[12.5px] font-sora font-bold bg-white text-ink">Contact sales</Link>
                : cur ? <div className="rounded-full py-2.5 text-center text-[12.5px] font-sora font-bold bg-white/10 text-white opacity-70">Current plan</div>
                : <Link href={`/checkout?plan=${k}`} className={`block text-center rounded-full py-2.5 text-[12.5px] font-sora font-bold transition hover:-translate-y-0.5 ${isFeatured ? 'bg-brand-gradient text-white' : 'bg-white text-bangladesh-green border border-bangladesh-green/20'}`}>
                    {PLANS[profile.plan].price > p.price && profile.plan !== 'trial' ? 'Downgrade' : 'Upgrade'}</Link>}
            </div>); })}
      </div>

      <h3 className="font-sora font-bold mb-3 flex items-center gap-2 text-rich-black"><Icon name="history" className="text-stone" />Billing history</h3>
      <div className="glass-card-light glass-highlight overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-[13px]">
          <thead><tr className="text-left text-[11px] text-stone border-b border-bangladesh-green/12 bg-anti-flash-white">
            <th className="p-3.5">Date</th><th>Plan</th><th>Amount</th><th>Method</th><th>Status</th><th>Receipt</th></tr></thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id} className="border-b border-bangladesh-green/8">
                <td className="p-3.5 text-rich-black">{new Date(p.created_at).toLocaleDateString()}</td>
                <td className="capitalize text-rich-black">{p.plan}</td>
                <td className="font-mono text-rich-black">{p.currency} {p.amount}</td>
                <td className="capitalize text-rich-black">{p.method || '—'}</td>
                <td><span className={`text-[10px] font-bold px-2 py-1 rounded-full ${p.status === 'successful' ? 'bg-success/15 text-success' : 'bg-rose-100 text-rose-500'}`}>{p.status?.toUpperCase()}</span></td>
                <td><button className="pill !text-[10px]" onClick={() => window.print()}><Icon name="print" className="text-[12px] align-middle" /> Invoice</button></td>
              </tr>))}
            {!payments.length && <tr><td colSpan={6} className="p-8 text-center text-stone text-sm">No payments yet.</td></tr>}
          </tbody>
        </table>
        </div>
        <div className="px-3 pb-3 text-[11px] text-stone md:hidden">Swipe horizontally to see all billing columns.</div>
      </div>
    </AppShell>
  );
}

export default function Billing() {
  return <Suspense><BillingInner /></Suspense>;
}
