'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import { useProfile } from '@/components/useProfile';
import { supabase } from '@/lib/supabase';

export default function Settings() {
  const { profile, setProfile } = useProfile();
  const [form, setForm] = useState<any>({});
  const [saved, setSaved] = useState(false);
  useEffect(() => { if (profile) setForm(profile); }, [profile]);
  if (!profile) return null;
  return (
    <AppShell title="Settings" subtitle="Your profile and account.">
      <div className="glass p-6 max-w-xl">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input className="field" placeholder="Name" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input className="field" placeholder="Company" value={form.company || ''} onChange={e => setForm({ ...form, company: e.target.value })} />
          <input className="field" placeholder="Industry" value={form.industry || ''} onChange={e => setForm({ ...form, industry: e.target.value })} />
          <input className="field" placeholder="Country" value={form.country || ''} onChange={e => setForm({ ...form, country: e.target.value })} />
        </div>
        <input className="field mb-4" placeholder="Avatar URL" value={form.avatar_url || ''} onChange={e => setForm({ ...form, avatar_url: e.target.value })} />
        <button className="cta px-7 py-3 text-sm" onClick={async () => {
          const { name, company, industry, country, avatar_url } = form;
          await supabase.from('profiles').update({ name, company, industry, country, avatar_url }).eq('id', profile.id);
          setProfile({ ...profile, ...form }); setSaved(true); setTimeout(() => setSaved(false), 1500);
        }}>{saved ? '✓ Saved' : 'Save profile'}</button>
      </div>
    </AppShell>
  );
}
