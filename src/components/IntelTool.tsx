'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function IntelTool({ tool, fields, table, renderReport, cta }: any) {
  const [input, setInput] = useState<any>({});
  const [report, setReport] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const run = async () => {
    if (busy) return; setBusy(true); setErr(''); setReport(null);
    try {
      const r = await fetch('/api/intel', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool, input }) });
      const j = await r.json();
      if (j.error) throw new Error(j.error);
      setReport(j.data);
      if (table) supabase.from(table).insert({ ...(table === 'campaigns'
        ? { name: input.brand || input.name || 'Campaign', budget: parseFloat(input.budget) || null, goals: input.goals, audience: input.audience, plan: j.data }
        : table === 'competitors' ? { name: input.name, industry: input.industry, report: j.data }
        : { scope: input.scope, industry: input.industry, report: j.data }) });
    } catch (e: any) { setErr(e.message); }
    setBusy(false);
  };

  return (
    <div className="grid lg:grid-cols-[380px_1fr] gap-5 items-start">
      <div className="glass p-6">
        {fields.map((f: any) => f.options ? (
          <div key={f.key} className="mb-3">
            <div className="text-[10px] font-bold tracking-widest text-slate-400 mb-2">{f.label.toUpperCase()}</div>
            <div className="flex flex-wrap gap-2">{f.options.map((o: string) => (
              <button key={o} onClick={() => setInput({ ...input, [f.key]: o })}
                className={`pill !text-[12px] ${input[f.key] === o ? '!bg-gradient-to-r from-secondary to-primary !text-white !border-transparent' : ''}`}>{o}</button>))}</div>
          </div>
        ) : (
          <input key={f.key} className="field mb-3" placeholder={f.label} value={input[f.key] || ''}
            onChange={e => setInput({ ...input, [f.key]: e.target.value })} />
        ))}
        <button className="cta w-full py-3.5 text-sm mt-2" disabled={busy} onClick={run}>{busy ? '🧠 Analyzing…' : cta}</button>
        {err && <p className="text-rose-500 text-xs mt-3">{err}</p>}
      </div>
      <div>
        {busy && <div className="glass p-8 space-y-3"><div className="sk h-4 w-2/3" /><div className="sk h-3 w-5/6" /><div className="sk h-3 w-1/2" /><div className="sk h-3 w-3/4" /></div>}
        {!busy && !report && <div className="glass p-12 text-center text-sm text-slate-500">Results appear here.</div>}
        {report && <div className="animate-rise space-y-4">{renderReport(report)}</div>}
      </div>
    </div>
  );
}

export function Block({ title, children }: any) {
  return <div className="glass p-5"><h3 className="font-sora font-bold text-sm mb-3"><span className="text-primary">/</span> {title}</h3>{children}</div>;
}
export const Bullets = ({ items }: any) => <ul className="space-y-1.5 text-[13.5px]">{(items||[]).map((x: any, i: number) =>
  <li key={i} className="flex gap-2"><span className="text-success font-bold">✓</span><span>{typeof x === 'string' ? x : JSON.stringify(x)}</span></li>)}</ul>;
