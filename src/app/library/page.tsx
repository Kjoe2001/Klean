'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { supabase } from '@/lib/supabase';
import { CONTENT_TYPES } from '@/lib/content-types';
import { readApiResponse } from '@/lib/http';

export default function Library() {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState(''); const [type, setType] = useState('');
  const LOCAL_ITEMS_KEY = 'zelvo:generated-items';

  async function getCurrentUser() {
    const { data: { session } } = await supabase.auth.getSession();
    let user = session?.user || null;

    if (!user) {
      const { data: auth } = await supabase.auth.getUser();
      user = auth.user || null;
    }

    if (!user) {
      const { data: refreshed } = await supabase.auth.getSession();
      user = refreshed.session?.user || null;
    }

    return user;
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

  async function getAccessToken() {
    const { data: { session } } = await supabase.auth.getSession();
    let token = session?.access_token || null;
    if (token) return token;

    await supabase.auth.getUser();
    const refreshed = await supabase.auth.getSession();
    token = refreshed.data.session?.access_token || null;
    return token;
  }

  async function loadGeneratedItems() {
    const localItems = readLocalGeneratedItems();
    const token = await getAccessToken();

    if (!token) {
      return { generatedItems: localItems };
    }

    try {
      const response = await fetch('/api/library', { headers: { Authorization: `Bearer ${token}` } });
      const data = await readApiResponse(response);
      const serverItems = Array.isArray(data.items) ? data.items : [];
      return { generatedItems: serverItems.length ? serverItems : localItems };
    } catch {
      return { generatedItems: localItems };
    }

    return { generatedItems: localItems };
  }

  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();
      if (!user) return;

      const { generatedItems } = await loadGeneratedItems();

      setItems(generatedItems.map((item: any) => ({
        ...item,
        body: item.body,
      })).sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)));
    })();
  }, []);
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
          const bodyText = typeof i.body === 'string' ? i.body : JSON.stringify(i.body);
          return (
            <div key={i.id} className="glass p-5">
              <div className="flex items-center gap-2 mb-2">
                <span>{t?.icon || '📄'}</span><b className="font-sora text-[13px] flex-1 truncate">{i.title}</b>
                <button className="text-rose-400 text-xs" onClick={async () => {
                  const user = await getCurrentUser();
                  if (!user) return;
                  const token = await getAccessToken();
                  if (token) {
                    await fetch('/api/library', {
                      method: 'DELETE',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                      body: JSON.stringify({ id: i.id }),
                    });
                  }

                  setItems(p => p.filter(x => x.id !== i.id));
                }}>✕</button>
              </div>
              <pre className="text-[11px] text-slate-500 whitespace-pre-wrap max-h-28 overflow-hidden">{bodyText.slice(0, 220)}…</pre>
              <div className="flex justify-between items-center mt-3">
                <span className="text-[10px] font-mono text-slate-400">{new Date(i.created_at).toLocaleDateString()}</span>
                <button className="pill !text-[11px]" onClick={() => navigator.clipboard.writeText(bodyText)}>⧉ Copy</button>
              </div>
            </div>);
        })}
        {!filtered.length && <div className="glass p-12 text-center text-sm text-slate-500 col-span-full">Nothing here yet — generate something in Content Studio.</div>}
      </div>
    </AppShell>
  );
}
