'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { useProfile } from '@/components/useProfile';
import { supabase } from '@/lib/supabase';
import { PLANS } from '@/lib/plans';
import Link from 'next/link';

export default function Billing() {
  const { profile } = useProfile();
  const [payments, setPayments] = useState<any[]>([]);
  const [sub, setSub] = useState<any>(null);
  useEffect(() => { (async () => {
    const { data: p } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
    setPayments(p || []);
    const { data: s } = await supabase.from('subscriptions').select('*').eq('status', 'active').maybeSingle();
    setSub(s);
  })(); }, []);
  if (!profile) return null;
  const order = ['starter','pro','studio','agency','enterprise'] as const;

  return (
    <AppShell title="Billing" subtitle="Plan, payments, invoices — card, MTN MoMo, Telecel Cash, AirtelTigo & bank transfer via Flutterwave.">
      <div className="glass p-6 mb-5 flex flex-wrap items-center gap-4">
        <div className="flex-1">
          <div className="font-mono text-[10px] font-bold tracking-widest text-primary">CURRENT PLAN</div>
          <div className="font-sora font-extrabold text-2xl">{PLANS[profile.plan].name}</div>
          {sub?.current_period_end && <div className="text-xs text-slate-500">Renews {new Date(sub.current_period_end).toLocaleDateString()}</div>}
        </div>
        {profile.plan !== 'trial' && (
          <button className="pill !text-rose-500" onClick={async () => {
            if (!confirm('Cancel subscription? You keep access until the period ends.')) return;
            await supabase.from('subscriptions').update({ status: 'cancelled' }).eq('user_id', profile.id);
            alert('Cancelled — access continues to period end.');
          }}>Cancel subscription</button>)}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-7">
        {order.map(k => { const p = PLANS[k]; const cur = profile.plan === k; const ent = k === 'enterprise';
          return (
            <div key={k} className={`rounded-3xl p-5 ${p.popular ? 'border-2 border-primary bg-white dark:bg-white/5' : ent ? 'bg-ink text-white' : 'glass'}`}>
              <div className="font-sora font-extrabold">{p.name}</div>
              <div className="my-2">{p.price >= 0 ? <><span className="font-sora font-extrabold text-2xl">${p.price}</span><span className="text-xs text-slate-400">/mo</span></> : <b>Custom</b>}</div>
              {ent ? <Link href="/contact" className="pill block text-center !bg-white !text-ink">Contact sales</Link>
                : cur ? <div className="pill text-center opacity-60">Current plan</div>
                : <Link href={`/checkout?plan=${k}`} className={`block text-center rounded-full py-2.5 text-[12.5px] font-sora font-bold ${p.popular ? 'cta' : 'bg-slate-100 dark:bg-white/10'}`}>
                    {PLANS[profile.plan].price > p.price && profile.plan !== 'trial' ? 'Downgrade' : 'Upgrade'}</Link>}
            </div>); })}
      </div>

      <h3 className="font-sora font-bold mb-3">Billing history</h3>
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
                <td><button className="pill !text-[10px]" onClick={() => window.print()}>🖨 Invoice</button></td>
              </tr>))}
            {!payments.length && <tr><td colSpan={6} className="p-8 text-center text-slate-400 text-sm">No payments yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
