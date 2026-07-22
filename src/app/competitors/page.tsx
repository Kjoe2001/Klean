'use client';
import AppShell from '@/components/AppShell';
import IntelTool, { Block, Bullets } from '@/components/IntelTool';
import Locked from '@/components/Locked';
import { useProfile } from '@/components/useProfile';
import { can } from '@/lib/plans';

export default function Competitors() {
  const { profile } = useProfile();
  if (!profile) return null;
  if (!can(profile.plan, 'competitors')) return <AppShell title="Competitor Intelligence"><Locked feature="Competitor Intelligence" plan="Studio" /></AppShell>;
  return (
    <AppShell title="Competitor Intelligence" subtitle="AI researches a competitor live and maps your opening.">
      <IntelTool tool="competitor" table="competitors" cta="🎯 Analyze competitor"
        fields={[{ key: 'name', label: 'Competitor name' }, { key: 'industry', label: 'Industry' }]}
        renderReport={(r: any) => (<>
          <Block title="Overview"><p className="text-sm leading-relaxed">{r.overview}</p></Block>
          <Block title="Social performance">{(r.social_performance||[]).map((s: any, i: number) => (
            <div key={i} className="flex gap-3 text-sm mb-2"><b className="w-24 shrink-0 text-bangladesh-green">{s.platform}</b><span className="text-stone">{s.assessment}</span></div>))}</Block>
          <Block title="Content gaps"><Bullets items={r.content_gaps} /></Block>
          <Block title="Campaign ideas they can't copy"><Bullets items={r.campaign_ideas} /></Block>
          <Block title="Your opportunities"><Bullets items={r.opportunities} /></Block>
        </>)} />
    </AppShell>
  );
}
