'use client';
import AppShell from '@/components/AppShell';
import PageHead from '@/components/PageHead';
import { INTEGRATIONS } from '@/lib/journey';

export default function Integrations() {
  const cats = [...new Set(INTEGRATIONS.map(i => i.cat))];
  return (
    <AppShell>
      <PageHead kicker="INTEGRATIONS HUB" title="Connect your stack"
        sub="Publish, measure and automate where you already work. Connected services power scheduling, analytics and approvals." />
      {cats.map(c => (
        <div key={c} className="mb-7">
          <div className="font-sora font-bold text-sm text-slate-500 mb-3">{c}</div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {INTEGRATIONS.filter(i => i.cat === c).map(i => (
              <div key={i.id} className="glass p-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-white/10 grid place-items-center text-xl">{i.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-sora font-bold text-[14px]">{i.name}</div>
                  <div className="text-[11.5px] text-slate-500 truncate">{i.desc}</div>
                </div>
                {i.status === 'connected'
                  ? <span className="text-[11px] font-bold text-emerald border border-emerald/30 bg-emerald/5 rounded-full px-3 py-1">Connected</span>
                  : <button className="pill !py-2 hover:!border-primary">Connect</button>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </AppShell>
  );
}
