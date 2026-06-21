'use client';
import AppShell from '@/components/AppShell';
import PageHead from '@/components/PageHead';
import { CASE_STUDIES } from '@/lib/journey';

export default function CaseStudies() {
  return (
    <AppShell>
      <PageHead kicker="CASE STUDIES" title="Brands winning with Zelvoo"
        sub="Real results from brands and agencies across Ghana and Africa." />
      <div className="grid sm:grid-cols-2 gap-5">
        {CASE_STUDIES.map(c => (
          <div key={c.id} className="glass p-6 flex flex-col">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{c.logo}</span>
              <div><div className="font-sora font-bold">{c.brand}</div><div className="text-[11px] text-slate-400">{c.sector}</div></div>
            </div>
            <div className="my-5">
              <div className="font-sora font-extrabold text-4xl grad-text">{c.metric}</div>
              <div className="text-[13px] text-slate-500">{c.label}</div>
            </div>
            <div className="text-[13.5px] italic text-slate-600 dark:text-slate-300 border-l-2 border-primary pl-3 mt-auto">“{c.quote}”</div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
