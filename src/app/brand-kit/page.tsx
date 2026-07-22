'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { supabase } from '@/lib/supabase';

const empty = { name: '', industry: '', audience: '', tone: '', taglines: '', guidelines: '', fonts: '', colors: ['#7C3AED', '#FF6B2C'], logo_url: '' };

export default function BrandKit() {
  const [brands, setBrands] = useState<any[]>([]);
  const [form, setForm] = useState<any>(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [status, setStatus] = useState('');

  const load = async () => {
    const { data, error } = await supabase.from('brands').select('*').order('created_at', { ascending: false });
    if (error) {
      setStatus(error.message || 'Could not load Brand Kits.');
      return;
    }
    setBrands(data || []);
  };

  const ensureProfile = async (user: { id: string; email?: string | null; user_metadata?: any }) => {
    // Some legacy users can exist in auth.users without a matching profiles row.
    // brands.user_id references profiles(id), so create a minimal profile when missing.
    const fallbackName = user.email?.split('@')[0] || 'user';
    const fullName = user.user_metadata?.full_name || fallbackName;
    await supabase.from('profiles').upsert(
      { id: user.id, email: user.email || `${user.id}@placeholder.local`, name: fullName },
      { onConflict: 'id' }
    );
  };

  useEffect(() => { load(); }, []);

  const uploadLogo = async (file: File) => {
    const { data: { user } } = await supabase.auth.getUser(); if (!user) return;
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('brand-assets').upload(path, file);
    if (!error) {
      const { data } = supabase.storage.from('brand-assets').getPublicUrl(path);
      setForm({ ...form, logo_url: data.publicUrl });
    } else alert('Create a public "brand-assets" bucket in Supabase Storage first.');
  };

  const save = async () => {
    setStatus('');
    if (!form.name?.trim()) {
      setStatus('Brand name is required.');
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setStatus('Your session expired. Please log in again.');
      return;
    }

    await ensureProfile(user);

    if (editing) {
      const { error } = await supabase.from('brands').update(form).eq('id', editing);
      if (error) { setStatus(error.message || 'Could not save Brand Kit changes.'); return; }
      setStatus('Brand Kit updated.');
    } else {
      const { error } = await supabase.from('brands').insert({ ...form, user_id: user.id });
      if (error) { setStatus(error.message || 'Could not create Brand Kit.'); return; }
      setStatus('Brand Kit created.');
    }

    setForm(empty);
    setEditing(null);
    await load();
  };

  return (
    <AppShell title="Brand Kit" subtitle="Every generation automatically follows the selected brand's voice, colors and guidelines.">
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="glass p-6">
          <h2 className="font-sora font-bold mb-4">{editing ? '✏ Edit brand' : '＋ New brand'}</h2>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input className="field" placeholder="Brand name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <input className="field" placeholder="Industry" value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} />
          </div>
          <input className="field mb-3" placeholder="Audience" value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })} />
          <input className="field mb-3" placeholder="Tone of voice — e.g. bold, warm, pan-African pride" value={form.tone} onChange={e => setForm({ ...form, tone: e.target.value })} />
          <input className="field mb-3" placeholder="Taglines (comma separated)" value={form.taglines} onChange={e => setForm({ ...form, taglines: e.target.value })} />
          <input className="field mb-3" placeholder="Fonts — e.g. Sora / Inter" value={form.fonts} onChange={e => setForm({ ...form, fonts: e.target.value })} />
          <textarea className="field mb-3 min-h-[70px]" placeholder="Brand guidelines — dos & don'ts the AI must follow" value={form.guidelines} onChange={e => setForm({ ...form, guidelines: e.target.value })} />
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-bold text-slate-400">COLORS</span>
            {form.colors.map((c: string, i: number) => (
              <input key={i} type="color" value={c} className="w-9 h-9 rounded-lg border-none cursor-pointer"
                onChange={e => { const cs = [...form.colors]; cs[i] = e.target.value; setForm({ ...form, colors: cs }); }} />))}
            <button className="pill !text-[11px]" onClick={() => setForm({ ...form, colors: [...form.colors, '#10B981'] })}>＋</button>
          </div>
          <label className="pill !text-[12px] cursor-pointer inline-block mb-4">
            {form.logo_url ? '✓ Logo uploaded' : '⬆ Upload logo'}
            <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadLogo(e.target.files[0])} />
          </label>
          {!!status && <p className="text-xs text-pistachio mb-3">{status}</p>}
          <button className="cta w-full py-3 text-sm" onClick={save}>{editing ? 'Save changes' : 'Create brand'}</button>
        </div>
        <div className="space-y-3">
          {brands.map(b => (
            <div key={b.id} className="glass p-5 flex items-center gap-4">
              {b.logo_url ? <img src={b.logo_url} className="w-12 h-12 rounded-xl object-cover" alt="" />
                : <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-primary grid place-items-center text-white font-sora font-bold">{b.name[0]}</div>}
              <div className="flex-1 min-w-0">
                <div className="font-sora font-bold text-sm">{b.name}</div>
                <div className="text-xs text-slate-500 truncate">{b.industry} · {b.tone || 'no tone set'}</div>
                <div className="flex gap-1.5 mt-1.5">{(b.colors || []).map((c: string, i: number) => <span key={i} className="w-4 h-4 rounded-full border border-white" style={{ background: c }} />)}</div>
              </div>
              <button className="pill !text-[11px]" onClick={() => { setForm({ ...empty, ...b }); setEditing(b.id); }}>Edit</button>
              <button className="pill !text-[11px] !text-rose-500" onClick={async () => {
                const { error } = await supabase.from('brands').delete().eq('id', b.id);
                if (error) { setStatus(error.message || 'Could not delete Brand Kit.'); return; }
                setStatus('Brand Kit deleted.');
                await load();
              }}>✕</button>
            </div>))}
          {!brands.length && <div className="glass p-10 text-center text-sm text-slate-500">No brands yet — create your first Brand Kit and every module will inherit it.</div>}
        </div>
      </div>
    </AppShell>
  );
}
