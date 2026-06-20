'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { supabase } from '@/lib/supabase';
import { CONTENT_TYPES } from '@/lib/content-types';

export default function Library() {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState(''); const [type, setType] = useState('');
  useEffect(() => { supabase.from('content').select('*').order('created_at', { ascending: false }).limit(200).then(({ data }) => setItems(data || [])); }, []);
  const filtered = items.filter(i => (!type || i.type === type) && (!q || JSON.stringify(i).toLowerCase().includes(q.toLowerCase())));
  return (
    <AppShell title="Content Library" subtitle="Everything you generate is saved here automatically.">
      <div className="flex flex-wrap gap-3 mb-5">
        <input className="field !w-72" placeholder="🔎 Search content…" value={q} onChange={e => setQ(e.target.value)} />
        <select className="field !w-52" value={type} onChange={e => setType(e.target.value)}>
          <option value="">All types</option>
          {CONTENT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(i => {
          const t = CONTENT_TYPES.find(x => x.id === i.type);
          return (
            <div key={i.id} className="glass p-5">
              <div className="flex items-center gap-2 mb-2">
                <span>{t?.icon || '📄'}</span><b className="font-sora text-[13px] flex-1 truncate">{i.title}</b>
                <button className="text-rose-400 text-xs" onClick={async () => { await supabase.from('content').delete().eq('id', i.id); setItems(p => p.filter(x => x.id !== i.id)); }}>✕</button>
              </div>
              <pre className="text-[11px] text-slate-500 whitespace-pre-wrap max-h-28 overflow-hidden">{JSON.stringify(i.body).slice(0, 220)}…</pre>
              <div className="flex justify-between items-center mt-3">
                <span className="text-[10px] font-mono text-slate-400">{new Date(i.created_at).toLocaleDateString()}</span>
                <button className="pill !text-[11px]" onClick={() => navigator.clipboard.writeText(JSON.stringify(i.body, null, 2))}>⧉ Copy</button>
              </div>
            </div>);
        })}
        {!filtered.length && <div className="glass p-12 text-center text-sm text-slate-500 col-span-full">Nothing here yet — generate something in Content Studio.</div>}
      </div>
    </AppShell>
  );
}
