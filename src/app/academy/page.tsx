'use client';
import AppShell from '@/components/AppShell';
import PageHead from '@/components/PageHead';
import { ACADEMY } from '@/lib/journey';

export default function Academy() {
  const tracks = [...new Set(ACADEMY.map(l => l.track))];
  return (
    <AppShell>
      <PageHead kicker="ZELVO ACADEMY" title="Learn to market like a pro"
        sub="Short, practical lessons that turn the platform into pipeline. Earn a Zelvoo Certified badge as you go." />
      <div className="glass p-5 mb-6 flex items-center gap-5 flex-wrap">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-primary grid place-items-center text-2xl text-white">🎓</div>
        <div className="flex-1 min-w-[200px]">
          <div className="font-sora font-bold">Your progress · 2 of {ACADEMY.length} lessons</div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 mt-2 overflow-hidden"><div className="h-full bg-gradient-to-r from-secondary to-primary" style={{ width: '25%' }} /></div>
        </div>
        <span className="pill !py-2">Get certified →</span>
      </div>
      {tracks.map(t => (
        <div key={t} className="mb-7">
          <div className="font-sora font-bold text-sm text-slate-500 mb-3">{t}</div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ACADEMY.filter(l => l.track === t).map(l => (
              <div key={l.id} className="glass p-4 hover:-translate-y-1 transition flex flex-col">
                <div className="text-2xl">{l.icon}</div>
                <div className="font-sora font-bold text-[13.5px] mt-2 flex-1">{l.title}</div>
                <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400">
                  <span>{l.level}</span><span>▶ {l.mins} min</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </AppShell>
  );
}
