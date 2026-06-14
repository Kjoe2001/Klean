'use client';
import AppShell from '@/components/AppShell';
import IntelTool, { Block, Bullets } from '@/components/IntelTool';
import Locked from '@/components/Locked';
import { useProfile } from '@/components/useProfile';
import { can } from '@/lib/plans';

export default function CampaignBuilder() {
  const { profile } = useProfile();
  if (!profile) return null;
  if (!can(profile.plan, 'campaigns')) return <AppShell title="Campaign Builder"><Locked feature="Campaign Builder" plan="Pro" /></AppShell>;
  return (
    <AppShell title="Campaign Builder" subtitle="Brand + budget + goals in. Full strategy, media plan, KPIs and timeline out.">
      <IntelTool tool="campaign" table="campaigns" cta="◎ Build campaign"
        fields={[{ key: 'brand', label: 'Brand' }, { key: 'budget', label: 'Budget (USD or GHS)' },
          { key: 'goals', label: 'Goals — e.g. 10k signups in Q3' }, { key: 'audience', label: 'Audience' }]}
        renderReport={(r: any) => (<>
          <Block title="Strategy"><p className="text-sm leading-relaxed">{r.strategy}</p></Block>
          <Block title="Media plan">{(r.media_plan||[]).map((m: any, i: number) => (
            <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-white/5 rounded-xl p-3 mb-2 text-sm">
              <b>{m.channel}</b><span className="font-mono text-primary font-bold">{m.share}</span>
              <span className="text-slate-500 text-xs flex-1 ml-4">{m.rationale}</span></div>))}</Block>
          <Block title="Content plan">{(r.content_plan||[]).map((c: any, i: number) => (
            <div key={i} className="mb-2 text-sm"><b className="text-primary">Week {c.week}:</b> {c.theme} <span className="text-slate-500">— {(c.assets||[]).join(', ')}</span></div>))}</Block>
          <Block title="Influencer plan"><Bullets items={r.influencer_plan} /></Block>
          <Block title="KPI forecast">{(r.kpi_forecast||[]).map((k: any, i: number) => (
            <div key={i} className="flex justify-between text-sm py-1.5 border-b border-slate-100 dark:border-white/5"><span>{k.kpi}</span><b className="grad-text">{k.target}</b></div>))}</Block>
          <Block title="Budget allocation">{(r.budget_allocation||[]).map((b: any, i: number) => (
            <div key={i} className="mb-2"><div className="flex justify-between text-xs font-semibold mb-1"><span>{b.item}</span><span>{b.percent}%</span></div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-white/10"><div className="h-2 rounded-full bg-gradient-to-r from-secondary to-primary" style={{ width: `${b.percent}%` }} /></div></div>))}</Block>
          <Block title="Timeline">{(r.timeline||[]).map((t: any, i: number) => (
            <div key={i} className="flex gap-3 text-sm mb-1.5"><span className="font-mono text-[11px] text-secondary font-bold w-20">{t.weeks}</span>{t.phase}</div>))}</Block>
        </>)} />
    </AppShell>
  );
}
