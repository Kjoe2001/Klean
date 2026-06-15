'use client';
import { useState } from 'react';
import AppShell from '@/components/AppShell';
import { supabase } from '@/lib/supabase';
import { IMAGE_SIZES, IMAGE_MODES, pollUrl } from '@/lib/image-presets';
import SmartImage from '@/components/SmartImage';

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
  const [images, setImages] = useState<{ prompt: string; full: string; w: number; h: number; seed: number }[]>([]);
  const [busy, setBusy] = useState(false);

  const generate = async (regen = false) => {
    if (!prompt.trim() || busy) return;
    setBusy(true);
    const full = prompt + (MODE_STYLE[mode] || '') + ', high quality, no text';
    const seed = Math.floor(Math.random() * 9999);
    const url = pollUrl(full, size.w, size.h, seed);
    setImages(p => [{ prompt, full, w: size.w, h: size.h, seed }, ...p]);
    supabase.from('images').insert({ prompt, mode, size: size.id, url });
    setBusy(false);
  };

  const download = async (url: string) => {
    const blob = await (await fetch(url)).blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'zelvo-image.jpg'; a.click();
  };

  return (
    <AppShell title="AI Image Studio" subtitle="Product photography, ad creatives, thumbnails, billboards — text to visual in seconds.">
      <div className="glass p-6 mb-5">
        <textarea className="field min-h-[80px]" placeholder="Describe the image… e.g. African woman holding a glass of fresh juice in a sunlit modern kitchen"
          value={prompt} onChange={e => setPrompt(e.target.value)} />
        <div className="flex flex-wrap gap-2 mt-4 mb-3">
          {IMAGE_MODES.map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              className={`pill !text-[12px] ${mode === m.id ? '!bg-gradient-to-r from-secondary to-primary !text-white !border-transparent' : ''}`}>{m.label}</button>))}
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {IMAGE_SIZES.map(s => (
            <button key={s.id} onClick={() => setSize(s)}
              className={`pill !text-[11px] ${size.id === s.id ? '!border-primary !text-primary font-bold' : ''}`}>{s.label}</button>))}
        </div>
        <button className="cta px-8 py-3.5 text-sm" disabled={busy || !prompt.trim()} onClick={() => generate()}>
          {busy ? '🎨 Painting…' : '🎨 Generate image'}
        </button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((im, i) => (
          <div key={i} className="glass !rounded-2xl overflow-hidden animate-rise">
            <div style={{ aspectRatio: `${im.w} / ${im.h}` }} className="w-full">
              <SmartImage prompt={im.full} w={im.w} h={im.h} seed={im.seed} rounded="rounded-none" className="w-full h-full" />
            </div>
            <div className="p-3 flex gap-2 flex-wrap">
              <button className="pill !text-[11px]" onClick={() => download(pollUrl(im.full, im.w, im.h, im.seed))}>⬇ Download</button>
              <button className="pill !text-[11px]" onClick={() => { setPrompt(im.prompt); generate(true); }}>↻ Regenerate</button>
              <button className="pill !text-[11px]" onClick={() => setPrompt(im.prompt)}>✏ Edit prompt</button>
            </div>
          </div>))}
      </div>
    </AppShell>
  );
}
