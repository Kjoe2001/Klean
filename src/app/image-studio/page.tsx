'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import GlassCard from '@/components/GlassCard';
import Button from '@/components/ui/Button';
import { Textarea, Select } from '@/components/ui/Input';
import { Icon } from '@/components/Icon';
import Link from 'next/link';
import { useProfile } from '@/components/useProfile';
import { supabase } from '@/lib/supabase';
import { IMAGE_SIZES, IMAGE_MODES, IMAGE_GENERATION_ENABLED } from '@/lib/image-presets';
import { CREDIT_COST } from '@/lib/plans';
import { readApiResponse } from '@/lib/http';

async function getAccessToken() {
  let { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) return session.access_token;
  await supabase.auth.getUser();
  ({ data: { session } } = await supabase.auth.getSession());
  if (session?.access_token) return session.access_token;
  const refreshed = await supabase.auth.refreshSession();
  return refreshed.data.session?.access_token || null;
}

async function postImageWithAuth(payload: any) {
  let token = await getAccessToken();
  if (!token) throw new Error('Please log in again to generate images.');

  let response = await fetch('/api/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

  if (response.status !== 401) return response;

  token = await getAccessToken();
  if (!token) return response;
  return fetch('/api/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export default function ImageStudio() {
  const { profile } = useProfile();
  const [brands, setBrands] = useState<any[]>([]);
  const [brandId, setBrandId] = useState('');
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState(IMAGE_MODES[0].id);
  const [size, setSize] = useState(IMAGE_SIZES[0].id);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [result, setResult] = useState('');
  const [gallery, setGallery] = useState<any[]>([]);

  const cost = CREDIT_COST.image ?? 8;

  const loadGallery = () => {
    supabase.from('images').select('*').order('created_at', { ascending: false }).limit(48)
      .then(({ data }) => setGallery(data || []));
  };

  useEffect(() => {
    supabase.from('brands').select('*').then(({ data }) => setBrands(data || []));
    loadGallery();
  }, []);

  if (!profile) return null;

  if (!IMAGE_GENERATION_ENABLED) {
    return (
      <AppShell title="Image Studio" subtitle="Image generation is temporarily unavailable.">
        <div className="glass-card-light glass-highlight p-6 mb-5">
          <div className="flex items-start gap-3">
            <span className="w-10 h-10 rounded-xl bg-bangladesh-green/10 text-bangladesh-green grid place-items-center">
              <Icon name="info" className="text-xl" />
            </span>
            <div>
              <h2 className="font-heading font-semibold text-rich-black">Image generation is paused</h2>
              <p className="text-sm text-stone mt-1">
                We&apos;re between AI providers right now, so image generation is temporarily switched off. It&apos;ll be back soon — use Content Studio and Campaign Builder in the meantime.
              </p>
              <Link href="/content-studio" className="inline-flex mt-4 rounded-full bg-caribbean-green text-rich-black font-heading font-medium px-5 py-2.5 text-sm hover:brightness-110 transition">
                Open Content Studio
              </Link>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  const unlimited = profile.unlimited_credits === true || profile.is_admin === true || profile.role === 'admin';
  const canAfford = unlimited || (profile.credits ?? 0) >= cost;

  const generate = async () => {
    if (!prompt.trim() || busy || !canAfford) return;
    setBusy(true);
    setErr('');
    try {
      const brand = brands.find(b => b.id === brandId);
      const fullPrompt = brand
        ? `${prompt.trim()} — brand tone: ${brand.tone || 'as described'}${brand.colors?.length ? `, palette: ${brand.colors.join(', ')}` : ''}`
        : prompt.trim();

      const r = await postImageWithAuth({ prompt: fullPrompt, mode, size, brandId: brandId || null });
      const j = await readApiResponse(r);
      setResult(j.url);
      if (typeof j.balance === 'number') window.dispatchEvent(new Event('credits:changed'));
      loadGallery();
    } catch (e: any) {
      setErr(e.message === 'insufficient_credits' ? `You need ${cost} credits to generate an image.` : e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell title="Image Studio" subtitle="Generate campaign-ready visuals with Gemini 3 Pro Image — our highest-quality image model.">
      <div className="grid xl:grid-cols-[1fr_1.05fr] gap-5">
        <div>
          <GlassCard className="mb-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-medium text-rich-black"><Icon name="auto_awesome" className="mr-1 align-middle text-caribbean-green" />Prompt</h2>
              <select className="field !w-auto !py-2 text-xs" value={brandId} onChange={e => setBrandId(e.target.value)}>
                <option value="">No Brand Kit</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name} (Brand Kit)</option>)}
              </select>
            </div>

            <Textarea
              placeholder="Describe the image — e.g. 'a bottle of artisanal shea body oil on a marble surface, soft morning light, minimalist'"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className="mb-3"
            />

            <div className="grid grid-cols-2 gap-3 mb-4">
              <Select label="Style" value={mode} onChange={e => setMode(e.target.value)}>
                {IMAGE_MODES.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
              </Select>
              <Select label="Size" value={size} onChange={e => setSize(e.target.value)}>
                {IMAGE_SIZES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </Select>
            </div>

            <Button onClick={generate} disabled={busy || !prompt.trim() || !canAfford} loading={busy} className="w-full">
              {!canAfford ? `Need ${cost} credits` : busy ? 'Generating…' : `Generate — ${cost} credits`}
            </Button>
            {err && <p className="text-xs text-danger font-medium mt-3">{err}</p>}
            {!unlimited && <p className="text-[11px] text-stone mt-2 text-center">You have {profile.credits} credits.</p>}
          </GlassCard>
        </div>

        <div>
          <GlassCard className="mb-5 !p-3 min-h-[280px] grid place-items-center">
            {busy && (
              <div className="text-center py-10">
                <div className="w-8 h-8 mx-auto rounded-full border-2 border-caribbean-green border-t-transparent animate-spin" />
                <p className="text-xs text-stone mt-3">Generating your image…</p>
              </div>
            )}
            {!busy && result && (
              <div className="w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={result} alt={prompt} className="w-full rounded-[14px] object-cover" />
                <a href={result} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-caribbean-green hover:underline">
                  <Icon name="download" className="text-base" /> Open full size
                </a>
              </div>
            )}
            {!busy && !result && (
              <div className="text-center py-10 text-stone text-sm">Your generated image will appear here.</div>
            )}
          </GlassCard>
        </div>
      </div>

      {gallery.length > 0 && (
        <div className="mt-2">
          <h3 className="font-heading font-medium text-rich-black text-sm mb-3">Your generations</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {gallery.map(img => (
              <a key={img.id} href={img.url} target="_blank" rel="noreferrer" className="block rounded-[12px] overflow-hidden border border-bangladesh-green/10 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.prompt} className="w-full aspect-square object-cover group-hover:opacity-80 transition-opacity" />
              </a>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}
