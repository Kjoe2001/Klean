'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { supabase } from '@/lib/supabase';

const ROLES = ['admin','editor','viewer'];
export default function Workspaces() {
  const [list, setList] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [invite, setInvite] = useState<any>({});
  const load = async () => {
    const { data: ws } = await supabase.from('workspaces').select('*, workspace_members(*)');
    setList(ws || []);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!name) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from('workspaces').insert({ name, owner_id: user!.id }).select().single();
    if (data) await supabase.from('workspace_members').insert({ workspace_id: data.id, user_id: user!.id, role: 'owner' });
    setName(''); load();
  };

  return (
    <AppShell title="Workspaces" subtitle="Team collaboration with owner, admin, editor and viewer roles.">
      <div className="glass p-5 mb-5 flex gap-3">
        <input className="field !w-72" placeholder="Workspace name — e.g. Zelvoo Creative Team" value={name} onChange={e => setName(e.target.value)} />
        <button className="cta px-6 py-3 text-sm" onClick={create}>＋ Create workspace</button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {list.map(ws => (
          <div key={ws.id} className="glass p-5">
            <div className="font-sora font-bold">{ws.name}</div>
            <div className="text-xs text-slate-500 mb-3">{ws.workspace_members?.length || 1} member(s)</div>
            <div className="space-y-1.5 mb-3">
              {(ws.workspace_members||[]).map((m: any) => (
                <div key={m.user_id} className="flex justify-between text-xs bg-slate-50 dark:bg-white/5 rounded-lg px-3 py-2">
                  <span className="font-mono">{m.user_id.slice(0, 8)}…</span>
                  <span className="font-bold text-primary uppercase">{m.role}</span>
                </div>))}
            </div>
            <div className="flex gap-2">
              <input className="field !py-2 !text-xs" placeholder="Invite by user ID (email invites: see STATUS.md)"
                value={invite[ws.id]?.id || ''} onChange={e => setInvite({ ...invite, [ws.id]: { ...invite[ws.id], id: e.target.value } })} />
              <select className="field !w-28 !py-2 !text-xs" value={invite[ws.id]?.role || 'editor'}
                onChange={e => setInvite({ ...invite, [ws.id]: { ...invite[ws.id], role: e.target.value } })}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
              <button className="pill !text-[11px]" onClick={async () => {
                const v = invite[ws.id]; if (!v?.id) return;
                await supabase.from('workspace_members').insert({ workspace_id: ws.id, user_id: v.id, role: v.role || 'editor' }); load();
              }}>Add</button>
            </div>
          </div>))}
      </div>
    </AppShell>
  );
}
