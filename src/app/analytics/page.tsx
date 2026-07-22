'use client';
import { useState } from 'react';
import AppShell from '@/components/AppShell';
import GlassCard from '@/components/GlassCard';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { Icon } from '@/components/Icon';
import { spendCredits } from '@/lib/credits';

const CHANNELS = [
  { name: 'Facebook', icon: 'thumb_up' },
  { name: 'Instagram', icon: 'photo_camera' },
  { name: 'LinkedIn', icon: 'business_center' },
  { name: 'TikTok', icon: 'music_note' },
  { name: 'Google Analytics', icon: 'query_stats' },
];
const METRICS = [['Reach','—'],['Engagement','—'],['CTR','—'],['Followers','—'],['Leads','—'],['ROI','—']];

export default function Analytics() {
  const [insights, setInsights] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [pasted, setPasted] = useState('');

  const run = async () => {
    setBusy(true);
    setErr('');
    setInsights(null);
    try {
      const credit = await spendCredits('intel');
      if (!credit.ok) {
        setErr(`Insufficient credits. This analysis needs ${credit.needed ?? 2} credits.`);
        return;
      }
      const r = await fetch('/api/intel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'insights', input: { metrics: pasted || 'No data connected yet — give general next-step guidance for a brand starting analytics.' } }),
      });
      const j = await r.json();
      if (j.error) { setErr(j.error); return; }
      setInsights(j.data);
    } catch (e: any) {
      setErr(e?.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell title="Analytics" subtitle="Track performance and get AI insights across your channels.">
      <GlassCard className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-medium text-rich-black">Channels</h2>
          <Badge variant="muted">Coming soon</Badge>
        </div>
        <p className="text-sm text-stone mb-4">
          Live channel connections (pulling reach, engagement and followers directly from each platform) are on our roadmap — each one requires its own developer app approval, so they roll out one at a time. For now, paste exported metrics below for instant AI analysis.
        </p>
        <div className="flex flex-wrap gap-2">
          {CHANNELS.map(c => (
            <span key={c.name} className="inline-flex items-center gap-2 rounded-full border border-bangladesh-green/15 bg-bangladesh-green/5 px-4 py-2 text-[12.5px] text-stone opacity-70">
              <Icon name={c.icon} className="text-[16px]" />{c.name}
            </span>
          ))}
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
        {METRICS.map(([l, v]) => (
          <GlassCard key={l} className="!p-4 text-center">
            <div className="font-heading font-semibold text-xl text-rich-black">{v}</div>
            <div className="text-[10px] font-bold text-stone mt-1">{l.toUpperCase()}</div>
          </GlassCard>
        ))}
      </div>

      <GlassCard>
        <h3 className="font-heading font-medium text-rich-black mb-2">
          <Icon name="psychology" className="mr-1 align-middle text-caribbean-green" />AI Insights
        </h3>
        <Textarea
          placeholder="Paste any exported metrics (CSV rows, screenshots transcribed, platform stats) and Zelvoo will analyze them…"
          value={pasted}
          onChange={e => setPasted(e.target.value)}
          className="mb-3"
        />
        <Button onClick={run} disabled={busy} loading={busy}>
          {busy ? 'Analyzing…' : 'Generate insights'}
        </Button>
        {err && <p className="text-xs text-danger font-medium mt-3">{err}</p>}
        {insights && (
          <div className="mt-4 space-y-3 animate-rise">
            <ul className="space-y-1.5 text-sm text-rich-black">
              {(insights.insights || []).map((x: string, i: number) => (
                <li key={i} className="flex items-start gap-2"><Icon name="lightbulb" className="text-caribbean-green text-base mt-0.5" />{x}</li>
              ))}
            </ul>
            <div className="bg-anti-flash-white rounded-xl p-4 border border-bangladesh-green/12">
              <b className="text-sm text-rich-black">Next moves:</b>
              <ul className="mt-1 space-y-1 text-sm text-rich-black">
                {(insights.actions || []).map((x: string, i: number) => <li key={i}>→ {x}</li>)}
              </ul>
            </div>
            {insights.forecast && <p className="text-sm text-bangladesh-green font-semibold">{insights.forecast}</p>}
          </div>
        )}
      </GlassCard>
    </AppShell>
  );
}
