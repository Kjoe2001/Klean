'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import Ring from '@/components/Ring';
import { useProfile } from '@/components/useProfile';
import { supabase } from '@/lib/supabase';
import { CONTENT_TYPES } from '@/lib/content-types';
import { spendCredits } from '@/lib/credits';
import { canType, can } from '@/lib/plans';
import { pollUrl } from '@/lib/image-presets';
import SmartImage from '@/components/SmartImage';
import Link from 'next/link';

const TONES = ['Bold','Premium','Playful','Trusted','Youth','Corporate'];
const PLATFORMS = ['Instagram','TikTok','LinkedIn','X','Facebook','YouTube'];

export default function ContentStudio() {
  const { profile } = useProfile();
  const [brands, setBrands] = useState<any[]>([]);
  const [brandId, setBrandId] = useState('');
  const [brief, setBrief] = useState({ brand: '', industry: '', audience: '', focus: '', tone: 'Bold', platform: 'Instagram' });
  const [selected, setSelected] = useState<Set<string>>(new Set(['hooks','post','caption']));
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<Record<string, any>>({});
  const [scores, setScores] = useState<Record<string, any>>({});

  useEffect(() => { supabase.from('brands').select('*').then(({ data }) => setBrands(data || [])); }, []);
  useEffect(() => {
    const b = brands.find(x => x.id === brandId);
    if (b) setBrief(v => ({ ...v, brand: b.name, industry: b.industry || v.industry, audience: b.audience || v.audience }));
  }, [brandId]);

  if (!profile) return null;
  const plan = profile.plan;
  const ready = brief.brand && brief.industry && brief.audience;
  const busy = loadingIds.size > 0;

  const toggle = (id: string) => {
    if (busy || !canType(plan, id)) return;
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const generate = async () => {
    if (!ready || busy || !selected.size) return;
    const brandKit = brands.find(x => x.id === brandId) || null;
    const ids = [...selected];
    setLoadingIds(new Set(ids));
    await Promise.all(ids.map(async id => {
      try {
        const credit = await spendCredits('text');
        if (!credit.ok) { setResults(p => ({ ...p, [id]: { __error: 'Out of credits — upgrade to keep generating.' } })); return; }
        window.dispatchEvent(new Event('credits:changed'));
        const r = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: id, brief, brand: brandKit }) });
        const j = await r.json();
        if (j.error) throw new Error(j.error);
        setResults(p => ({ ...p, [id]: j.data }));
        await supabase.from('content').insert({ type: id, title: `${brief.brand} — ${id}`, body: j.data, brand_id: brandId || null });
        if (can(plan, 'score')) {
          const sr = await fetch('/api/score', { method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: j.data, brief }) });
          const sj = await sr.json();
          if (sj.data) setScores(p => ({ ...p, [id]: sj.data }));
        }
      } catch (e: any) { setResults(p => ({ ...p, [id]: { __error: e.message } })); }
      finally { setLoadingIds(s => { const n = new Set(s); n.delete(id); return n; }); }
    }));
  };

  return (
    <AppShell title="Content Studio" subtitle="16 content types. One brief. Parallel generation with AI scoring.">
      <div className="grid xl:grid-cols-[1fr_1.05fr] gap-5">
        <div>
          <div className="glass p-6 mb-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-sora font-bold"><span className="msym msym-sm text-primary align-middle mr-1">edit_note</span>Brief</h2>
              <select className="field !w-auto !py-2 text-xs" value={brandId} onChange={e => setBrandId(e.target.value)}>
                <option value="">No Brand Kit</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name} (Brand Kit)</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input className="field" placeholder="Brand" value={brief.brand} onChange={e => setBrief({ ...brief, brand: e.target.value })} />
              <input className="field" placeholder="Industry" value={brief.industry} onChange={e => setBrief({ ...brief, industry: e.target.value })} />
            </div>
            <input className="field mb-3" placeholder="Audience" value={brief.audience} onChange={e => setBrief({ ...brief, audience: e.target.value })} />
            <input className="field mb-4" placeholder="Campaign focus (optional)" value={brief.focus} onChange={e => setBrief({ ...brief, focus: e.target.value })} />
            {[['Tone', TONES, 'tone'], ['Platform', PLATFORMS, 'platform']].map(([l, opts, key]: any) => (
              <div key={key} className="mb-3">
                <div className="text-[10px] font-bold tracking-widest text-slate-400 mb-2">{l.toUpperCase()}</div>
                <div className="flex flex-wrap gap-2">
                  {opts.map((o: string) => (
                    <button key={o} onClick={() => setBrief({ ...brief, [key]: o })}
                      className={`pill !text-[12px] ${ (brief as any)[key] === o ? '!bg-gradient-to-r from-secondary to-primary !text-white !border-transparent' : '' }`}>{o}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {CONTENT_TYPES.map(t => {
              const locked = !canType(plan, t.id);
              const sel = selected.has(t.id); const ld = loadingIds.has(t.id);
              return (
                <button key={t.id} onClick={() => locked ? null : toggle(t.id)}
                  className={`relative text-left rounded-2xl p-4 transition hover:-translate-y-0.5
                    ${sel && !locked ? 'feature-card' : 'bg-white dark:bg-white/5 shadow-glass'} ${locked ? 'opacity-90' : ''}`}>
                  {locked && (
                    <Link href="/billing" className="absolute inset-0 z-10 rounded-2xl bg-white/70 dark:bg-ink/70 backdrop-blur-[2px] grid place-items-center">
                      <span className="msym msym-sm text-secondary mr-1">lock</span><span className="text-[11px] font-sora font-bold grad-text align-middle">Upgrade</span>
                    </Link>)}
                  <div className="flex justify-between items-start">
                    <span className={`msym ${sel && !locked ? 'text-feature-muted' : 'text-slate-400'}`}>{t.msym}</span>
                    {ld ? <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      : <span className={`w-[18px] h-[18px] rounded-full grid place-items-center text-[10px] font-bold text-white ${sel ? 'bg-brand-gradient' : 'border-2 border-slate-300'}`}>
                          {sel ? <span className="msym" style={{fontSize:'11px', verticalAlign:'-1px'}}>check</span> : ''}
                        </span>}
                  </div>
                  <div className={`font-sora font-bold text-[12.5px] mt-1.5 ${sel && !locked ? 'text-white' : ''}`}>{t.label}</div>
                  <div className={`text-[10.5px] ${sel && !locked ? 'feature-dim' : 'text-slate-500'}`}>{t.desc}</div>
                  <div className={`text-[9.5px] mt-1.5 font-mono ${sel && !locked ? 'feature-dim' : 'text-slate-400'}`}>1 credit</div>
                </button>
              );
            })}
          </div>

          <button onClick={generate} disabled={busy || !ready || !selected.size}
            className="w-full py-4 mt-5 text-[15px] sticky bottom-4 rounded-full bg-brand-gradient text-white font-sora font-bold disabled:opacity-50 transition hover:-translate-y-0.5">
            <span className="msym msym-sm align-middle mr-1.5">auto_awesome</span>
            {busy ? `Generating ${loadingIds.size}…` : !ready ? 'Fill the brief to start' : `Generate Content (${selected.size})`}
          </button>
        </div>

        {/* RESULTS */}
        <div className="space-y-4">
          {!Object.keys(results).length && !busy && (
            <div className="glass p-12 text-center">
              <span className="msym text-primary" style={{fontSize:'32px'}}>auto_awesome</span>
              <div className="font-sora font-bold mt-2">Your content lands here</div>
              <p className="text-sm text-slate-500 mt-1">Results stream in live and save to your Library automatically.</p>
            </div>)}
          {CONTENT_TYPES.filter(t => results[t.id] || loadingIds.has(t.id)).map(t => (
            <div key={t.id} className="glass p-5 animate-rise">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-xl bg-brand-gradient grid place-items-center"><span className="msym msym-sm text-white">{t.msym}</span></span>
                <span className="font-sora font-bold text-[14px] flex-1">{t.label}</span>
                {loadingIds.has(t.id) && <span className="text-[11px] text-primary font-semibold">thinking…</span>}
                {results[t.id] && !results[t.id].__error &&
                  <button className="pill !text-[11px]" onClick={() => navigator.clipboard.writeText(JSON.stringify(results[t.id], null, 2))}><span className="msym" style={{fontSize:"13px",verticalAlign:"-2px"}}>content_copy</span> Copy</button>}
              </div>
              {loadingIds.has(t.id) ? <div className="space-y-2"><div className="sk h-3 w-5/6" /><div className="sk h-3 w-2/3" /><div className="sk h-3 w-3/4" /></div>
                : results[t.id].__error ? <p className="text-rose-500 text-sm">{results[t.id].__error}</p>
                : <RenderResult id={t.id} d={results[t.id]} />}
              {scores[t.id] && (
                <div className="flex justify-around mt-4 pt-4 border-t border-slate-100 dark:border-white/10">
                  <Ring value={scores[t.id].virality} color="#FF6B2C" label="Virality" />
                  <Ring value={scores[t.id].engagement} color="#7C3AED" label="Engagement" />
                  <Ring value={scores[t.id].readability} color="#38BDF8" label="Readability" />
                  <Ring value={scores[t.id].brand_fit} color="#10B981" label="Brand fit" />
                </div>)}
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function RenderResult({ id, d }: any) {
  const Img = ({ p }: any) => p ?
    <SmartImage prompt={p + ', professional brand photography, vibrant'} w={1024} h={1024} className="h-36 mb-2" /> : null;
  if (d.items && id === 'hooks') return <ol className="list-decimal pl-5 space-y-1.5 text-sm font-semibold">{d.items.map((h: string, i: number) => <li key={i}>{h}</li>)}</ol>;
  if (d.items && id === 'post') return <div className="grid gap-2">{d.items.map((p: any, i: number) => (
    <div key={i} className="bg-slate-50 dark:bg-white/5 rounded-xl p-3"><Img p={p.image_prompt} />
      <div className="flex justify-between gap-2"><b className="text-sm">{p.title}</b><span className="text-[10px] font-mono text-primary">{p.format}</span></div>
      <div className="text-[13px] text-slate-500 my-1">{p.idea}</div>
      <div className="text-xs text-success font-semibold">CTA → {p.cta}</div></div>))}</div>;
  if (d.items && id === 'carousel') return <div className="grid gap-2">{d.items.map((s: any) => (
    <div key={s.slide} className="bg-slate-50 dark:bg-white/5 rounded-xl p-3"><Img p={s.image_prompt} />
      <span className="text-[10px] font-mono font-bold text-secondary">SLIDE {s.slide}</span>
      <div className="font-bold text-sm">{s.title}</div><div className="text-[13px] text-slate-500">{s.body}</div></div>))}</div>;
  return <pre className="text-[12px] whitespace-pre-wrap leading-relaxed font-inter bg-slate-50 dark:bg-white/5 rounded-xl p-4 max-h-96 overflow-auto">{
    typeof d === 'string' ? d : JSON.stringify(d, null, 2).replace(/[{}\[\]"]/g, '').replace(/,$/gm, '').replace(/^\s*$\n/gm, '')
  }</pre>;
}
