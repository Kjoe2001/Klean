'use client';
import { useState } from 'react';
import AppShell from '@/components/AppShell';
import { supabase } from '@/lib/supabase';
import { spendCredits } from '@/lib/credits';
import { IMAGE_SIZES, IMAGE_MODES } from '@/lib/image-presets';
import { Icon } from '@/components/Icon';

const MODE_STYLE: Record<string,string> = {
  text2img: '', product: ', professional product photography, studio lighting, clean background',
  adcreative: ', high-converting ad creative, bold composition, commercial photography',
  social: ', vibrant social media post visual, eye-catching', thumbnail: ', YouTube thumbnail style, dramatic lighting, high contrast',
  billboard: ', billboard advertisement concept, massive scale, minimal bold design',
  flyer: ', modern flyer design background, clean layout space', banner: ', wide web banner design, professional',
  campaign: ', premium brand campaign artwork, cinematic, art directed',
};

export default function ImageStudio() {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState('text2img');
  const [size, setSize] = useState(IMAGE_SIZES[0]);
  const [images, setImages] = useState<{ prompt: string; full: string; w: number; h: number; url: string; status: 'loading'|'ok'|'error' }[]>([]);
  const [busy, setBusy] = useState(false);

  const generate = async () => {
    if (!prompt.trim() || busy) return;
    setBusy(true);
    try {
      const credit = await spendCredits('image');
      if (credit.ok) window.dispatchEvent(new Event('credits:changed'));
    } catch {
      // Keep the studio usable even if credits are unavailable; the server route can fall back to a public image URL.
    }
    const full = prompt + (MODE_STYLE[mode] || '') + ', high quality, no text';
    const entry = { prompt, full, w: size.w, h: size.h, url: '', status: 'loading' as const };
    setImages(p => [entry, ...p]);
    try {
      const r = await fetch('/api/image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: full, w: size.w, h: size.h }) });
      const d = await r.json();
      setImages(p => p.map(im => im === entry ? { ...im, url: d.url || '', status: d.url ? 'ok' : 'error' } : im));
      if (d.url) supabase.from('images').insert({ prompt, mode, size: size.id, url: d.url });
    } catch {
      setImages(p => p.map(im => im === entry ? { ...im, status: 'error' } : im));
    }
    setBusy(false);
  };

  const download = async (url: string) => {
    const blob = await (await fetch(url)).blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'zelvo-image.jpg'; a.click();
  };

  return (
    <AppShell title="AI Image Studio" subtitle="Product photography, ad creatives, thumbnails, billboards — text to visual in seconds.">
      <div className="feature-card p-6 mb-5">
        <textarea className="field !bg-white/[0.06] !border-white/10 !text-white placeholder:text-feature-dim min-h-[80px]" placeholder="Describe the image… e.g. African woman holding a glass of fresh juice in a sunlit modern kitchen"
          value={prompt} onChange={e => setPrompt(e.target.value)} />
        <div className="flex flex-wrap gap-2 mt-4 mb-3">
          {IMAGE_MODES.map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              className={`pill !text-[12px] ${mode === m.id ? '!bg-brand-gradient !text-white !border-transparent' : '!bg-white/[0.06] !border-white/10 !text-feature-muted'}`}>{m.label}</button>))}
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {IMAGE_SIZES.map(s => (
            <button key={s.id} onClick={() => setSize(s)}
              className={`pill !text-[11px] ${size.id === s.id ? '!border-secondary !text-secondary font-bold !bg-white/[0.06]' : '!bg-white/[0.06] !border-white/10 !text-feature-dim'}`}>{s.label}</button>))}
        </div>
        <button className="rounded-full bg-brand-gradient text-white font-sora font-bold px-8 py-3.5 text-sm transition hover:-translate-y-0.5 disabled:opacity-50" disabled={busy || !prompt.trim()} onClick={() => generate()}>
          <Icon name={busy ? 'hourglass_top' : 'auto_awesome'} className="mr-1.5 align-middle" />
          {busy ? 'Painting…' : 'Generate image · 3 credits'}
        </button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((im, i) => (
          <div key={i} className="glass !rounded-2xl overflow-hidden animate-rise">
            <div style={{ aspectRatio: `${im.w} / ${im.h}` }} className="w-full relative bg-slate-100 dark:bg-white/5">
              {im.status === 'loading' && <div className="absolute inset-0 grid place-items-center"><div className="w-7 h-7 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>}
              {im.status === 'error' && <div className="absolute inset-0 grid place-items-center text-center p-3"><span className="text-[12px] text-slate-500"><Icon name="broken_image" className="mx-auto mb-1 block text-slate-400" />Couldn't generate<br/><button className="text-primary font-semibold" onClick={() => { setPrompt(im.prompt); generate(); }}>Try again</button></span></div>}
              {im.url && <img src={im.url} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="p-3 flex gap-2 flex-wrap">
              <button className="pill !text-[11px]" disabled={!im.url} onClick={() => download(im.url)}><Icon name="download" className="text-[13px] align-middle" /> Download</button>
              <button className="pill !text-[11px]" onClick={() => { setPrompt(im.prompt); generate(); }}><Icon name="refresh" className="text-[13px] align-middle" /> Regenerate</button>
              <button className="pill !text-[11px]" onClick={() => setPrompt(im.prompt)}><Icon name="edit" className="text-[13px] align-middle" /> Edit prompt</button>
            </div>
          </div>))}
      </div>
    </AppShell>
  );
}
