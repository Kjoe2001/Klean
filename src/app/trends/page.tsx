'use client';
import AppShell from '@/components/AppShell';
import IntelTool, { Block, Bullets } from '@/components/IntelTool';
import Locked from '@/components/Locked';
import { useProfile } from '@/components/useProfile';
import { can } from '@/lib/plans';

export default function Trends() {
  const { profile } = useProfile();
  if (!profile) return null;
  if (!can(profile.plan, 'trends')) return <AppShell title="Trend Discovery"><Locked feature="Trend Discovery" plan="Pro" /></AppShell>;
  return (
    <AppShell title="Trend Discovery" subtitle="Live trends via web research — Ghana, Africa, global, or your industry.">
      <IntelTool tool="trends" table="trends" cta="📈 Discover trends"
        fields={[{ key: 'scope', label: 'Scope', options: ['Ghana','Africa','Global','My industry'] },
          { key: 'industry', label: 'Industry / niche — e.g. fintech, fashion, food' }]}
        renderReport={(r: any) => (<>
          <Block title="Trending hashtags"><div className="flex flex-wrap gap-2">{(r.trending_hashtags||[]).map((h: string, i: number) =>
            <span key={i} className="pill !text-[12px] !text-accent font-mono">#{h.replace(/^#/,'')}</span>)}</div></Block>
          <Block title="Viral content right now">{(r.viral_content||[]).map((v: any, i: number) => (
            <div key={i} className="bg-slate-50 dark:bg-white/5 rounded-xl p-3 mb-2 text-sm"><b>{v.format}</b><div className="text-slate-500 text-[13px]">{v.why}</div></div>))}</Block>
          <Block title="Search trends"><Bullets items={r.search_trends} /></Block>
          <Block title="Hot topics + angles">{(r.hot_topics||[]).map((t: any, i: number) => (
            <div key={i} className="mb-2 text-sm"><b className="text-primary">{t.topic}</b> — <span className="text-slate-500">{t.angle}</span></div>))}</Block>
          <Block title="AI recommendations"><Bullets items={r.recommendations} /></Block>
        </>)} />
    </AppShell>
  );
}
