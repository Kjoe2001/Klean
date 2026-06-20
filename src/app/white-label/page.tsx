'use client';
import { useState } from 'react';
import AppShell from '@/components/AppShell';
import PageHead from '@/components/PageHead';
import Locked from '@/components/Locked';
import { useProfile } from '@/components/useProfile';
import { can } from '@/lib/plans';

export default function WhiteLabel() {
  const { profile } = useProfile();
  const allowed = profile && can(profile.plan, 'clients');
  const [c, setC] = useState({ name: 'Umoooja Studio', primary: '#FF6B2C', domain: 'studio.umoooja.com', logo: 'U' });
  return (
    <AppShell>
      <PageHead kicker="WHITE-LABEL PORTAL" title="Make Zelvoo yours"
        sub="Agency plan: present the full platform to clients under your brand — your logo, colours and domain. Zelvoo disappears." />
      {!allowed ? <Locked plan="Agency" feature="White-label portal" /> : (
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="glass p-5 space-y-3">
            <div className="font-sora font-bold">Brand settings</div>
            <label className="block text-[12px] text-slate-500">Portal name<input value={c.name} onChange={e => setC({ ...c, name: e.target.value })} className="field mt-1" /></label>
            <label className="block text-[12px] text-slate-500">Custom domain<input value={c.domain} onChange={e => setC({ ...c, domain: e.target.value })} className="field mt-1 font-mono !text-[13px]" /></label>
            <label className="block text-[12px] text-slate-500">Primary colour
              <div className="flex gap-2 mt-1"><input type="color" value={c.primary} onChange={e => setC({ ...c, primary: e.target.value })} className="w-12 h-11 rounded-xl border border-slate-200" /><input value={c.primary} onChange={e => setC({ ...c, primary: e.target.value })} className="field font-mono" /></div>
            </label>
            <button className="cta w-full !py-3">Save & publish portal</button>
          </div>
          <div className="glass p-0 overflow-hidden">
            <div className="px-5 py-3 text-white flex items-center gap-2" style={{ background: c.primary }}>
              <span className="w-7 h-7 rounded-lg bg-white/20 grid place-items-center font-bold">{c.logo}</span>
              <span className="font-sora font-bold">{c.name}</span>
            </div>
            <div className="p-5">
              <div className="text-[11px] font-mono text-slate-400">{c.domain}</div>
              <div className="font-sora font-extrabold text-xl mt-2">Welcome back 👋</div>
              <div className="grid grid-cols-3 gap-2 mt-3">{['Content', 'Images', 'Calendar'].map(x => <div key={x} className="rounded-xl border border-slate-200 dark:border-white/10 p-3 text-center text-[12px]" style={{ color: c.primary }}>{x}</div>)}</div>
              <div className="text-[11px] text-slate-400 mt-4 text-center">Live preview · clients never see Zelvoo branding</div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
