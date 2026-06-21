'use client';
import { useEffect, useState, Suspense } from 'react';
import AppShell from '@/components/AppShell';
import { useProfile } from '@/components/useProfile';
import { supabase } from '@/lib/supabase';
import { PLANS } from '@/lib/plans';
import { getCredits } from '@/lib/credits';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function BillingInner() {
  const { profile } = useProfile();
  const [payments, setPayments] = useState<any[]>([]);
  const [sub, setSub] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const params = useSearchParams();
  const [showHistory, setShowHistory] = useState(params.get('history') === '1');
  const [liveCredits, setLiveCredits] = useState<number | null>(null);
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
      <div className="feature-card p-6 mb-5 flex flex-wrap items-center gap-4">
        <div className="flex-1">
          <div className="font-mono text-[10px] font-bold tracking-widest text-secondary">CURRENT PLAN</div>
          <div className="font-sora font-extrabold text-2xl text-white">{PLANS[profile.plan].name}</div>
          {sub?.current_period_end && <div className="text-xs feature-muted">Renews {new Date(sub.current_period_end).toLocaleDateString()}</div>}
        </div>
        <button onClick={() => setShowHistory(s => !s)} className="rounded-full bg-white/[0.08] text-white text-[12.5px] font-sora font-bold px-4 py-2 hover:bg-white/[0.14] transition">
          <span className="msym msym-sm align-middle mr-1">{liveCredits ?? profile.credits ?? 0} credits</span> · {showHistory ? 'Hide' : 'See'} usage
        </button>
        {profile.plan !== 'trial' && (
          <button className="pill !text-rose-400 !bg-white/[0.06] !border-white/10" onClick={async () => {
            if (!confirm('Cancel subscription? You keep access until the period ends.')) return;
            await supabase.from('subscriptions').update({ status: 'cancelled' }).eq('user_id', profile.id);
            alert('Cancelled — access continues to period end.');
          }}>Cancel subscription</button>)}
      </div>

      {showHistory && (
        <div className="glass p-5 mb-5 animate-rise">
          <div className="font-sora font-bold text-sm mb-3 flex items-center gap-2">
            <span className="msym msym-sm text-primary">receipt_long</span>What your credits were used for
          </div>
          {!history.length && <p className="text-slate-400 text-sm">No usage yet — generate something in Content or Image Studio and it'll show up here.</p>}
          <div className="space-y-1.5 max-h-80 overflow-y-auto">
            {history.map(h => (
              <div key={h.id} className="flex items-center justify-between text-[13px] py-2 border-b border-slate-50 dark:border-white/5 last:border-0">
                <div className="flex items-center gap-2.5">
                  <span className="msym msym-sm text-slate-400">{h.delta < 0 ? 'remove_circle' : 'add_circle'}</span>
                  <span>{h.reason || 'Usage'}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400 text-[12px]">
                  <span className={h.delta < 0 ? 'text-secondary font-semibold' : 'text-success font-semibold'}>{h.delta > 0 ? '+' : ''}{h.delta}</span>
                  <span>{new Date(h.created_at).toLocaleDateString()} · {new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-7">
        {order.map(k => { const p = PLANS[k]; const cur = profile.plan === k; const ent = k === 'enterprise';
          const isFeatured = p.popular || ent; const unit = k === 'weekly' ? '/6 days' : '/mo';
          return (
            <div key={k} className={`rounded-3xl p-5 relative ${isFeatured ? 'feature-card' : 'glass'}`}>
              {p.popular && <span className="badge-popular">Most popular</span>}
              <div className={`font-sora font-extrabold ${isFeatured ? 'text-white' : ''}`}>{p.name}</div>
              <div className="my-2">{p.price >= 0
                ? <><span className={`font-sora font-extrabold text-2xl ${isFeatured ? 'text-white' : ''}`}>${p.price}</span><span className={`text-xs ${isFeatured ? 'feature-dim' : 'text-slate-400'}`}>{unit}</span></>
                : <b className="text-white">Custom</b>}</div>
              <div className={`text-[11px] mb-3 ${isFeatured ? 'feature-dim' : 'text-slate-400'}`}>{p.credits.toLocaleString()} credits</div>
              {ent ? <Link href="/contact" className="block text-center rounded-full py-2.5 text-[12.5px] font-sora font-bold bg-white text-ink">Contact sales</Link>
                : cur ? <div className="rounded-full py-2.5 text-center text-[12.5px] font-sora font-bold bg-white/10 text-white opacity-70">Current plan</div>
                : <Link href={`/checkout?plan=${k}`} className={`block text-center rounded-full py-2.5 text-[12.5px] font-sora font-bold transition hover:-translate-y-0.5 ${isFeatured ? 'bg-brand-gradient text-white' : 'bg-slate-100 dark:bg-white/10'}`}>
                    {PLANS[profile.plan].price > p.price && profile.plan !== 'trial' ? 'Downgrade' : 'Upgrade'}</Link>}
            </div>); })}
      </div>

      <h3 className="font-sora font-bold mb-3 flex items-center gap-2"><span className="msym msym-sm text-slate-400">history</span>Billing history</h3>
      <div className="glass overflow-hidden">
        <table className="w-full text-[13px]">
          <thead><tr className="text-left text-[11px] text-slate-400 border-b border-slate-100 dark:border-white/10">
            <th className="p-3.5">Date</th><th>Plan</th><th>Amount</th><th>Method</th><th>Status</th><th>Receipt</th></tr></thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id} className="border-b border-slate-50 dark:border-white/5">
                <td className="p-3.5">{new Date(p.created_at).toLocaleDateString()}</td>
                <td className="capitalize">{p.plan}</td>
                <td className="font-mono">{p.currency} {p.amount}</td>
                <td className="capitalize">{p.method || '—'}</td>
                <td><span className={`text-[10px] font-bold px-2 py-1 rounded-full ${p.status === 'successful' ? 'bg-success/15 text-success' : 'bg-rose-100 text-rose-500'}`}>{p.status?.toUpperCase()}</span></td>
                <td><button className="pill !text-[10px]" onClick={() => window.print()}><span className="msym" style={{fontSize:'12px',verticalAlign:'-2px'}}>print</span> Invoice</button></td>
              </tr>))}
            {!payments.length && <tr><td colSpan={6} className="p-8 text-center text-slate-400 text-sm">No payments yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

export default function Billing() {
  return <Suspense><BillingInner /></Suspense>;
}
