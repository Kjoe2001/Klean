'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import Locked from '@/components/Locked';
import { useProfile } from '@/components/useProfile';
import { can } from '@/lib/plans';
import { supabase } from '@/lib/supabase';

export default function Clients() {
  const { profile } = useProfile();
  const [clients, setClients] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', email: '' });
  const load = () => supabase.from('clients').select('*, campaigns(count)').then(({ data }) => setClients(data || []));
  useEffect(() => { load(); }, []);
  if (!profile) return null;
  if (!can(profile.plan, 'clients')) return <AppShell title="Client Portal"><Locked feature="Client Portal" plan="Studio" /></AppShell>;

  return (
    <AppShell title="Client Portal" subtitle="Manage clients, share campaigns and calendars, request approvals.">
      <div className="glass p-5 mb-5 flex flex-wrap gap-3">
        <input className="field !w-64" placeholder="Client name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <input className="field !w-64" placeholder="Client email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <button className="cta px-6 py-3 text-sm" onClick={async () => {
          if (!form.name) return;
          const { data: { user } } = await supabase.auth.getUser();
          await supabase.from('clients').insert({ ...form, user_id: user!.id });
          setForm({ name: '', email: '' }); load();
        }}>＋ Add client</button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map(c => (
          <div key={c.id} className="glass p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary text-white grid place-items-center font-sora font-bold">{c.name[0]}</div>
              <div><div className="font-sora font-bold text-sm">{c.name}</div><div className="text-xs text-slate-500">{c.email}</div></div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="pill !text-[11px]" onClick={() => alert(`Share link: ${location.origin}/clients/${c.id} — public read-only client views ship with the approvals milestone (STATUS.md).`)}>🔗 Share campaigns</button>
              <button className="pill !text-[11px]" onClick={() => alert('Approval request emailed (wire to Resend/SMTP — STATUS.md).')}>✓ Request approval</button>
              <button className="pill !text-[11px] !text-rose-500" onClick={async () => { await supabase.from('clients').delete().eq('id', c.id); load(); }}>✕</button>
            </div>
          </div>))}
        {!clients.length && <div className="glass p-12 text-center text-sm text-slate-500 col-span-full">No clients yet.</div>}
      </div>
    </AppShell>
  );
}
