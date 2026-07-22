'use client';
import AppShell from '@/components/AppShell';
import IntelTool, { Block, Bullets } from '@/components/IntelTool';
import Locked from '@/components/Locked';
import { useProfile } from '@/components/useProfile';
import { can } from '@/lib/plans';
import { exportCampaignPDF } from '@/lib/export-campaign-pdf';
import { Icon } from '@/components/Icon';

export default function CampaignBuilder() {
  const { profile } = useProfile();
  if (!profile) return null;
  if (!can(profile.plan, 'campaigns')) return <AppShell title="Campaign Builder"><Locked feature="Campaign Builder" plan="Pro" /></AppShell>;
  return (
    <AppShell title="Campaign Builder" subtitle="Build complete campaigns with richer options, save every request, and export polished PDFs.">
      <IntelTool tool="campaign" table="campaigns" cta="◎ Build campaign"
        fields={[
          { key: 'brand', label: 'Brand' },
          { key: 'budget', label: 'Budget (USD or GHS)' },
          { key: 'goals', label: 'Goals — e.g. 10k signups in Q3' },
          { key: 'audience', label: 'Audience' },
          { key: 'objective', label: 'Primary objective', options: ['Awareness', 'Leads', 'Sales', 'Retention'] },
          { key: 'campaign_type', label: 'Campaign type', options: ['Launch', 'Always-on', 'Seasonal', 'Event push'] },
          { key: 'platform_mix', label: 'Platform focus', options: ['Instagram + TikTok', 'Meta full stack', 'LinkedIn + X', 'Google + YouTube'] },
          { key: 'duration_weeks', label: 'Duration (weeks)' },
          { key: 'region', label: 'Region/Market' },
          { key: 'offer', label: 'Offer or key message' },
          { key: 'constraints', label: 'Constraints (optional)' },
        ]}
        renderReport={(r: any) => (<>
          <div className="glass-card-light glass-highlight p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-heading font-medium text-rich-black text-[13px]">Campaign plan ready</p>
              <p className="text-[11px] text-stone mt-0.5">Download a client-ready PDF from this report.</p>
            </div>
            <button
              onClick={() => exportCampaignPDF(r)}
              className="inline-flex items-center gap-2 rounded-full bg-caribbean-green text-rich-black font-heading font-medium px-5 py-2.5 text-sm hover:brightness-110 transition"
            >
              <Icon name="picture_as_pdf" className="text-[16px] align-middle" />
              Export Campaign PDF
            </button>
          </div>
          <Block title="Strategy"><p className="text-sm leading-relaxed">{r.strategy}</p></Block>
          <Block title="Media plan">{(r.media_plan||[]).map((m: any, i: number) => (
            <div key={i} className="flex justify-between items-center bg-anti-flash-white border border-bangladesh-green/12 rounded-xl p-3 mb-2 text-sm">
              <b className="text-rich-black">{m.channel}</b><span className="font-mono text-bangladesh-green font-bold">{m.share}</span>
              <span className="text-stone text-xs flex-1 ml-4">{m.rationale}</span></div>))}</Block>
          <Block title="Channel strategy"><Bullets items={r.channel_strategy} /></Block>
          <Block title="Creative angles"><Bullets items={r.creative_angles} /></Block>
          <Block title="Content plan">{(r.content_plan||[]).map((c: any, i: number) => (
            <div key={i} className="mb-2 text-sm text-rich-black"><b className="text-bangladesh-green">Week {c.week}:</b> {c.theme} <span className="text-stone">- {(c.assets||[]).join(', ')}</span></div>))}</Block>
          <Block title="Influencer plan"><Bullets items={r.influencer_plan} /></Block>
          <Block title="Ad funnel"><Bullets items={r.ad_funnel} /></Block>
          <Block title="KPI forecast">{(r.kpi_forecast||[]).map((k: any, i: number) => (
            <div key={i} className="flex justify-between text-sm py-1.5 border-b border-bangladesh-green/12"><span className="text-rich-black">{k.kpi}</span><b className="text-bangladesh-green">{k.target}</b></div>))}</Block>
          <Block title="Budget allocation">{(r.budget_allocation||[]).map((b: any, i: number) => (
            <div key={i} className="mb-2"><div className="flex justify-between text-xs font-semibold mb-1"><span>{b.item}</span><span>{b.percent}%</span></div>
              <div className="h-2 rounded-full bg-bangladesh-green/18"><div className="h-2 rounded-full bg-gradient-to-r from-bangladesh-green to-caribbean-green" style={{ width: `${b.percent}%` }} /></div></div>))}</Block>
          <Block title="Timeline">{(r.timeline||[]).map((t: any, i: number) => (
            <div key={i} className="flex gap-3 text-sm mb-1.5 text-rich-black"><span className="font-mono text-[11px] text-bangladesh-green font-bold w-20">{t.weeks}</span>{t.phase}</div>))}</Block>
          <Block title="Risk controls"><Bullets items={r.risk_controls} /></Block>
          <Block title="Next 30 days"><Bullets items={r.next_30_days} /></Block>
        </>)} />
    </AppShell>
  );
}
