'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import Ring from '@/components/Ring';
import { useProfile } from '@/components/useProfile';
import { supabase } from '@/lib/supabase';
import { CONTENT_TYPES } from '@/lib/content-types';
import { canType, can } from '@/lib/plans';
import { pollUrl } from '@/lib/image-presets';
import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { exportContentPDF } from '@/lib/export-pdf';
import { readApiResponse } from '@/lib/http';

const TONES = ['Bold','Premium','Playful','Trusted','Youth','Corporate'];
const PLATFORMS = ['Instagram','TikTok','LinkedIn','X','Facebook','YouTube'];
const LOCAL_ITEMS_KEY = 'zelvo:generated-items';

async function getAccessToken() {
  let { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) return session.access_token;

  await supabase.auth.getUser();
  ({ data: { session } } = await supabase.auth.getSession());
  if (session?.access_token) return session.access_token;

  const refreshed = await supabase.auth.refreshSession();
  return refreshed.data.session?.access_token || null;
}

async function postGenerateWithAuth(payload: any) {
  let token = await getAccessToken();
  if (!token) throw new Error('Please log in again to generate content.');

  let response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

  if (response.status !== 401) return response;

  token = await getAccessToken();
  if (!token) return response;
  return fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

function readLocalGeneratedItems() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_ITEMS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalGeneratedItem(item: any) {
  if (typeof window === 'undefined') return;
  try {
    const current = readLocalGeneratedItems();
    const next = [item, ...current].slice(0, 150);
    window.localStorage.setItem(LOCAL_ITEMS_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event('zelvo:generated-items-changed'));
  } catch {}
}

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
    const raw = sessionStorage.getItem('zelvo:template-prefill');
    if (!raw) return;
    sessionStorage.removeItem('zelvo:template-prefill');
    try {
      const { focus, types } = JSON.parse(raw);
      if (focus) setBrief(v => ({ ...v, focus }));
      if (Array.isArray(types) && types.length) {
        setSelected(new Set(types.filter((id: string) => CONTENT_TYPES.some(ct => ct.id === id))));
      }
    } catch {}
  }, []);
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
        const r = await postGenerateWithAuth({ type: id, brief, brand: brandKit });
        const j = await readApiResponse(r);
        if (j.error) throw new Error(j.error);
        setResults(p => ({ ...p, [id]: j.data }));
        writeLocalGeneratedItem({
          id: `local-${id}-${Date.now()}`,
          user_id: null,
          brand_id: brandKit?.id || null,
          type: id,
          title: `${brief.brand} — ${id}`,
          body: j.data,
          created_at: new Date().toISOString(),
          source: 'local',
        });
        if (typeof j.balance === 'number' && typeof window !== 'undefined') {
          window.dispatchEvent(new Event('credits:changed'));
        }
        if (can(plan, 'score')) {
          const token = await getAccessToken();
          if (!token) {
            setScores(p => ({
              ...p,
              [id]: { virality: 0, engagement: 0, readability: 0, brand_fit: 0, verdict: 'Scoring skipped: login required.' },
            }));
            return;
          }
          const sr = await fetch('/api/score', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ content: j.data, brief }) });
          const sj = await readApiResponse(sr);
          if (typeof sj.balance === 'number' && typeof window !== 'undefined') {
            window.dispatchEvent(new Event('credits:changed'));
          }
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
          <div className="glass-card-light glass-highlight p-6 mb-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-medium text-rich-black"><Icon name="edit_note" className="mr-1 align-middle text-caribbean-green" />Brief</h2>
              <select className="field !w-auto !py-2 text-xs" value={brandId} onChange={e => setBrandId(e.target.value)}>
                <option value="">No Brand Kit</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name} (Brand Kit)</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <input className="field" placeholder="Brand" value={brief.brand} onChange={e => setBrief({ ...brief, brand: e.target.value })} />
              <input className="field" placeholder="Industry" value={brief.industry} onChange={e => setBrief({ ...brief, industry: e.target.value })} />
            </div>
            <input className="field mb-3" placeholder="Audience" value={brief.audience} onChange={e => setBrief({ ...brief, audience: e.target.value })} />
            <input className="field mb-4" placeholder="Campaign focus (optional)" value={brief.focus} onChange={e => setBrief({ ...brief, focus: e.target.value })} />
            {[['Tone', TONES, 'tone'], ['Platform', PLATFORMS, 'platform']].map(([l, opts, key]: any) => (
              <div key={key} className="mb-3">
                <div className="text-[10px] font-bold tracking-widest text-stone mb-2">{l.toUpperCase()}</div>
                <div className="flex flex-wrap gap-2">
                  {opts.map((o: string) => (
                    <button key={o} onClick={() => setBrief({ ...brief, [key]: o })}
                      className={`pill !text-[12px] ${ (brief as any)[key] === o ? '!bg-caribbean-green !text-rich-black !border-transparent' : '!bg-white !text-bangladesh-green !border-bangladesh-green/20' }`}>{o}</button>
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
                    ${sel && !locked ? 'feature-card' : 'glass-card-light glass-highlight'} ${locked ? 'opacity-90' : ''}`}>
                  {locked && (
                    <Link href="/billing" className="absolute inset-0 z-10 rounded-2xl bg-rich-black/75 backdrop-blur-[2px] grid place-items-center">
                      <Icon name="lock" className="mr-1 text-caribbean-green" /><span className="text-[11px] font-heading font-medium text-caribbean-green align-middle">Upgrade</span>
                    </Link>)}
                  <div className="flex justify-between items-start">
                    <Icon name={t.msym} className={sel && !locked ? 'text-feature-muted' : 'text-bangladesh-green'} />
                    {ld ? <span className="w-4 h-4 rounded-full border-2 border-caribbean-green border-t-transparent animate-spin" />
                      : <span className={`w-[18px] h-[18px] rounded-full grid place-items-center text-[10px] font-bold text-white ${sel ? 'bg-caribbean-green text-rich-black' : 'border-2 border-bangladesh-green/30'}`}>
                          {sel ? <Icon name="check" className="text-[11px]" /> : ''}
                        </span>}
                  </div>
                  <div className={`font-heading font-medium text-[12.5px] mt-1.5 ${sel && !locked ? 'text-anti-flash-white' : 'text-rich-black'}`}>{t.label}</div>
                  <div className={`text-[10.5px] ${sel && !locked ? 'feature-dim' : 'text-stone'}`}>{t.desc}</div>
                  <div className={`text-[9.5px] mt-1.5 font-mono ${sel && !locked ? 'feature-dim' : 'text-bangladesh-green'}`}>1 credit</div>
                </button>
              );
            })}
          </div>

          <button onClick={generate} disabled={busy || !ready || !selected.size}
            className="w-full py-4 mt-5 text-[15px] sticky bottom-4 rounded-full bg-caribbean-green text-rich-black font-heading font-medium disabled:opacity-50 transition hover:-translate-y-0.5 hover:brightness-110">
            <Icon name="auto_awesome" className="mr-1.5 align-middle" />
            {busy ? `Generating ${loadingIds.size}…` : !ready ? 'Fill the brief to start' : `Generate Content (${selected.size})`}
          </button>
        </div>

        {/* RESULTS */}
        <div className="space-y-4">
          {Object.keys(results).some(k => results[k] && !results[k].__error) && !busy && (
            <div className="flex items-center justify-between glass-card-light glass-highlight px-4 py-3 rounded-2xl">
              <div>
                <p className="font-heading font-medium text-rich-black text-[13px]">Your content is ready</p>
                <p className="text-[11px] text-stone mt-0.5">Download a branded PDF to share with clients or your team.</p>
              </div>
              <button
                onClick={() => exportContentPDF(brief, results, scores, CONTENT_TYPES)}
                className="inline-flex items-center gap-2 rounded-full bg-caribbean-green text-rich-black font-heading font-medium px-5 py-2.5 text-sm hover:brightness-110 transition shrink-0"
              >
                <Icon name="picture_as_pdf" className="text-[16px] align-middle" />
                Export PDF
              </button>
            </div>
          )}
          {!Object.keys(results).length && !busy && (
            <>
              <div className="glass-card-light glass-highlight p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-mono text-[10px] font-bold tracking-[0.25em] text-bangladesh-green">FIRST RUN</div>
                    <div className="font-heading font-medium mt-1 text-rich-black">Start with one brief and let the pack build around it.</div>
                    <p className="text-sm text-stone mt-1">A Brand Kit and a clear audience usually give the strongest first results.</p>
                  </div>
                  <Link href="/brand-kit" className="rounded-full border border-bangladesh-green/20 px-3.5 py-2 text-sm font-heading font-medium text-bangladesh-green hover:bg-bangladesh-green/10 transition">Open Brand Kit</Link>
                </div>
              </div>
              <div className="glass-card-light glass-highlight p-12 text-center">
                <Icon name="auto_awesome" className="text-bangladesh-green text-[32px]" />
                <div className="font-heading font-medium mt-2 text-rich-black">Your content lands here</div>
                <p className="text-sm text-stone mt-1">Results stream in live and save to your Library automatically.</p>
              </div>
            </>)}
          {CONTENT_TYPES.filter(t => results[t.id] || loadingIds.has(t.id)).map(t => (
            <div key={t.id} className="glass-card-light glass-highlight p-5 animate-rise overflow-x-auto">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-xl bg-caribbean-green grid place-items-center"><Icon name={t.msym} className="text-rich-black" /></span>
                <span className="font-heading font-medium text-[14px] flex-1 text-rich-black">{t.label}</span>
                {loadingIds.has(t.id) && <span className="text-[11px] text-caribbean-green font-medium">thinking...</span>}
                {results[t.id] && !results[t.id].__error &&
                  <button className="pill !text-[11px] !bg-white !text-bangladesh-green !border-bangladesh-green/20" onClick={() => navigator.clipboard.writeText(JSON.stringify(results[t.id], null, 2))}><Icon name="content_copy" className="text-[13px] align-middle" /> Copy</button>}
              </div>
              {loadingIds.has(t.id) ? <div className="space-y-2"><div className="sk h-3 w-5/6" /><div className="sk h-3 w-2/3" /><div className="sk h-3 w-3/4" /></div>
                : results[t.id].__error ? <p className="text-rose-500 text-sm">{results[t.id].__error}</p>
                : <RenderResult id={t.id} d={results[t.id]} />}
              {scores[t.id] && (
                <div className="flex justify-around mt-4 pt-4 border-t border-bangladesh-green/12 min-w-[460px]">
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
  if (d.items && id === 'hooks') return <ol className="list-decimal pl-5 space-y-1.5 text-sm font-semibold text-rich-black">{d.items.map((h: string, i: number) => <li key={i}>{h}</li>)}</ol>;
  if (d.items && id === 'post') return <div className="grid gap-2">{d.items.map((p: any, i: number) => (
    <div key={i} className="bg-white rounded-xl p-3 border border-bangladesh-green/15">
      <div className="flex justify-between gap-2"><b className="text-sm text-rich-black">{p.title}</b><span className="text-[10px] font-mono text-bangladesh-green">{p.format}</span></div>
      <div className="text-[13px] text-stone my-1">{p.idea}</div>
      <div className="text-xs text-success font-semibold">CTA → {p.cta}</div></div>))}</div>;
  if (d.items && id === 'carousel') return <div className="grid gap-2">{d.items.map((s: any) => (
    <div key={s.slide} className="bg-white rounded-xl p-3 border border-bangladesh-green/15">
      <span className="text-[10px] font-mono font-bold text-caribbean-green">SLIDE {s.slide}</span>
      <div className="font-bold text-sm text-rich-black">{s.title}</div><div className="text-[13px] text-stone">{s.body}</div></div>))}</div>;
  return <pre className="text-[12px] whitespace-pre-wrap leading-relaxed font-inter bg-white text-rich-black rounded-xl p-4 max-h-96 overflow-auto border border-bangladesh-green/15">{
    typeof d === 'string' ? d : JSON.stringify(d, null, 2).replace(/[{}\[\]"]/g, '').replace(/,$/gm, '').replace(/^\s*$\n/gm, '')
  }</pre>;
}
