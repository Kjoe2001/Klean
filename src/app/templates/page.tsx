'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import PageHead from '@/components/PageHead';
import { TEMPLATES } from '@/lib/journey';

const CATS = ['All', 'Calendar', 'Campaign', 'Social', 'Email'];
const tierColor: any = { free: 'text-emerald border-emerald/30 bg-emerald/5', starter: 'text-sky border-sky/30 bg-sky/5', pro: 'text-primary border-primary/30 bg-primary/5' };

export default function Templates() {
  const router = useRouter();
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');
  const list = TEMPLATES.filter(t => (cat === 'All' || t.cat === cat) && t.title.toLowerCase().includes(q.toLowerCase()));

  const useTemplate = (t: (typeof TEMPLATES)[number]) => {
    sessionStorage.setItem('zelvo:template-prefill', JSON.stringify({ focus: t.focus, types: t.types }));
    router.push('/content-studio');
  };
  return (
    <AppShell>
      <PageHead kicker="TEMPLATES MARKETPLACE" title="Start from a proven play"
        sub="Battle-tested campaign and content templates. One click loads the brief into Content Studio with your Brand Kit applied." />
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        {CATS.map(c => (
          <button key={c} onClick={() => setCat(c)} className={`pill ${cat === c ? '!bg-gradient-to-r from-secondary to-primary !text-white !border-transparent' : ''}`}>{c}</button>
        ))}
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search templates…" className="field !w-auto flex-1 min-w-[180px] !py-2.5" />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map(t => (
          <div key={t.id} className="glass p-5 hover:-translate-y-1 transition flex flex-col">
            <div className="flex items-start justify-between">
              <span className="text-3xl">{t.icon}</span>
              <span className={`text-[10px] font-bold uppercase border rounded-full px-2 py-0.5 ${tierColor[t.tier]}`}>{t.tier}</span>
            </div>
            <div className="font-sora font-bold mt-3">{t.title}</div>
            <div className="text-[12.5px] text-slate-500 mt-1 flex-1">{t.desc}</div>
            <div className="flex items-center justify-between mt-4">
              <span className="text-[11px] text-slate-400">{t.uses} uses · {t.cat}</span>
              <button onClick={() => useTemplate(t)} className="cta !px-4 !py-2 !text-[12px]">Use template →</button>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
