'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { useProfile } from '@/components/useProfile';
import GlassCard from '@/components/GlassCard';

export default function Admin() {
  const { profile } = useProfile();
  const [s, setS] = useState<any>(null); const [err, setErr] = useState('');
  useEffect(() => { if (!profile) return; (async () => {
    const r = await fetch('/api/admin/stats', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: profile.email }) });
    const j = await r.json();
    if (j.error) setErr(j.error); else setS(j.data);
  })(); }, [profile]);
  if (!profile) return null;
  if (err) return <AppShell title="Admin"><div className="glass p-10 text-center text-sm">🔒 {err} — add your email to ADMIN_EMAILS in Vercel env vars.</div></AppShell>;
  if (!s) return <AppShell title="Admin"><div className="sk h-40 rounded-3xl" /></AppShell>;
  const churn = s.active_subs ? Math.round(((s.paid_users - s.active_subs) / Math.max(s.paid_users,1)) * 100) : 0;
  const max = Math.max(1, ...Object.values(s.by_plan || {}) as number[]);
  return (
    <AppShell title="Admin Panel" subtitle="Revenue, growth and user management.">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[['Total users', s.total_users],['MRR', `$${s.mrr}`],['Revenue (all time)', `$${s.revenue_total}`],['Active subs', s.active_subs],
          ['Trial users', s.trial_users],['Paid users', s.paid_users],['Signups (30d)', s.signups_30d],['Churn est.', `${churn}%`]].map(([l, v]) => (
          <GlassCard key={l as string} className="!p-5 text-center">
            <div className="font-sora font-extrabold text-2xl grad-text">{v}</div>
            <div className="text-[10px] font-bold text-slate-400 mt-1">{(l as string).toUpperCase()}</div>
          </GlassCard>))}
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <GlassCard>
          <h3 className="font-sora font-bold text-sm mb-4">Users by plan</h3>
          <div className="flex items-end gap-3 h-32">
            {Object.entries(s.by_plan || {}).map(([p, n]: any) => (
              <div key={p} className="flex-1 text-center">
                <div className="text-xs font-bold">{n}</div>
                <div className="mx-auto w-3/4 rounded-t-xl bg-gradient-to-t from-primary to-secondary transition-all" style={{ height: `${(n / max) * 90}px` }} />
                <div className="text-[10px] text-slate-400 mt-1">{p}</div>
              </div>))}
          </div>
        </GlassCard>
        <GlassCard>
          <h3 className="font-sora font-bold text-sm mb-3">Recent payments</h3>
          <div className="space-y-2">
            {(s.recent_payments || []).map((p: any, i: number) => (
              <div key={i} className="flex justify-between text-[12.5px] bg-slate-50 dark:bg-white/5 rounded-xl px-3 py-2">
                <span className="capitalize">{p.plan} · {p.method || 'card'}</span>
                <span className="font-mono">{p.currency} {p.amount}</span>
                <span className={p.status === 'successful' ? 'text-success font-bold' : 'text-rose-500'}>{p.status}</span>
              </div>))}
            {!(s.recent_payments || []).length && <p className="text-sm text-slate-400 text-center py-6">No payments yet.</p>}
          </div>
          <p className="text-[11px] text-slate-400 mt-3">Full user management: Supabase Dashboard → Authentication → Users.</p>
        </GlassCard>
      </div>
    
      {/* Coupon engine */}
      <div className="glass p-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <div className="font-sora font-bold">Coupon engine</div>
          <button className="cta !px-4 !py-2 !text-[12px]">＋ New coupon</button>
        </div>
        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          {[['LAUNCH50','50% off · 3 months','142 redeemed','emerald'],['AGENCY20','20% off Agency','38 redeemed','primary'],['WC2026','30% off · World Cup','71 redeemed','secondary']].map((c,i)=>(
            <div key={i} className="rounded-xl border border-slate-200 dark:border-white/10 p-4">
              <div className={`font-mono font-bold text-${c[3]}`}>{c[0]}</div>
              <div className="text-[12px] text-slate-500 mt-1">{c[1]}</div>
              <div className="text-[11px] text-slate-400 mt-2">{c[2]}</div>
            </div>
          ))}
        </div>
        <div className="text-[12px] text-slate-400">Coupons apply at checkout and adjust the Flutterwave charge amount server-side.</div>
      </div>
    </AppShell>
  );
}
