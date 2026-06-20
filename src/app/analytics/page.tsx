'use client';
import { useState } from 'react';
import AppShell from '@/components/AppShell';
import GlassCard from '@/components/GlassCard';

const CHANNELS = ['Facebook','Instagram','LinkedIn','TikTok','Google Analytics'];
const METRICS = [['Reach','—'],['Engagement','—'],['CTR','—'],['Followers','—'],['Leads','—'],['ROI','—']];

export default function Analytics() {
  const [insights, setInsights] = useState<any>(null); const [busy, setBusy] = useState(false);
  const [pasted, setPasted] = useState('');
  const run = async () => {
    setBusy(true);
    const r = await fetch('/api/intel', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: 'insights', input: { metrics: pasted || 'No data connected yet — give general next-step guidance for a brand starting analytics.' } }) });
    const j = await r.json(); setInsights(j.data); setBusy(false);
  };
  return (
    <AppShell title="Analytics" subtitle="Connect channels, track performance, get AI insights.">
      <div className="flex flex-wrap gap-2 mb-5">
        {CHANNELS.map(c => <button key={c} className="pill !text-[12px]" onClick={() => alert(`${c} OAuth connection — wire the platform API per STATUS.md (each network requires its own app review).`)}>🔌 Connect {c}</button>)}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
        {METRICS.map(([l, v]) => <GlassCard key={l} className="!p-4 text-center">
          <div className="font-sora font-extrabold text-xl grad-text">{v}</div>
          <div className="text-[10px] font-bold text-slate-400 mt-1">{l.toUpperCase()}</div></GlassCard>)}
      </div>
      <GlassCard>
        <h3 className="font-sora font-bold text-sm mb-2">🧠 AI Insights</h3>
        <textarea className="field min-h-[90px] mb-3" placeholder="Paste any exported metrics (CSV rows, screenshots transcribed, platform stats) and Zelvoo will analyze them…"
          value={pasted} onChange={e => setPasted(e.target.value)} />
        <button className="cta px-6 py-3 text-sm" disabled={busy} onClick={run}>{busy ? 'Analyzing…' : 'Generate insights'}</button>
        {insights && (
          <div className="mt-4 space-y-3 animate-rise">
            <ul className="space-y-1.5 text-sm">{(insights.insights||[]).map((x: string, i: number) => <li key={i}>💡 {x}</li>)}</ul>
            <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4">
              <b className="text-sm">Next moves:</b>
              <ul className="mt-1 space-y-1 text-sm">{(insights.actions||[]).map((x: string, i: number) => <li key={i}>→ {x}</li>)}</ul>
            </div>
            <p className="text-sm text-primary font-semibold">{insights.forecast}</p>
          </div>)}
      </GlassCard>
    </AppShell>
  );
}
