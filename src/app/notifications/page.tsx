'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import PageHead from '@/components/PageHead';
import { supabase } from '@/lib/supabase';
import { readApiResponse } from '@/lib/http';

const dot: any = { emerald: 'bg-emerald', primary: 'bg-primary', sky: 'bg-sky', secondary: 'bg-secondary' };

async function getAccessToken() {
  let { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) return session.access_token;
  await supabase.auth.getUser();
  ({ data: { session } } = await supabase.auth.getSession());
  if (session?.access_token) return session.access_token;
  const refreshed = await supabase.auth.refreshSession();
  return refreshed.data.session?.access_token || null;
}

function formatWhen(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.max(1, Math.floor(diff / 60000));
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export default function Notifications() {
  const [list, setList] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setBusy(true);
    try {
      const token = await getAccessToken();
      if (!token) return;
      const response = await fetch('/api/notifications', { headers: { Authorization: `Bearer ${token}` } });
      const data = await readApiResponse(response);
      setList(data.notifications || []);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markAll = async () => {
    const token = await getAccessToken();
    if (!token) return;
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ all: true }),
    });
    setList((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const markOne = async (item: any) => {
    if (!item.unread) return;
    const token = await getAccessToken();
    if (!token) return;
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: item.id, source: item.source }),
    });
    setList((prev) => prev.map((n) => n.id === item.id ? { ...n, unread: false } : n));
  };

  return (
    <AppShell>
      <PageHead kicker="NOTIFICATIONS" title="Everything that needs you"
        sub="Approvals, publishes, team activity, billing and product updates — one feed." />
      <div className="flex justify-end mb-3">
        <button onClick={markAll} className="pill !py-2">Mark all read</button>
      </div>
      <div className="glass divide-y divide-slate-100 dark:divide-white/10">
        {!busy && !list.length && <div className="p-6 text-sm text-stone text-center">No notifications yet.</div>}
        {list.map(n => (
          <div key={n.id} onClick={() => markOne(n)}
            className={`flex items-start gap-4 p-4 cursor-pointer transition ${n.unread ? 'bg-primary/[0.03]' : ''}`}>
            <span className="text-xl mt-0.5">{n.icon}</span>
            <div className="flex-1">
              <div className="font-semibold text-[14px] flex items-center gap-2">{n.title}{n.unread && <span className={`w-1.5 h-1.5 rounded-full ${dot[n.color]}`} />}</div>
              <div className="text-[12.5px] text-slate-500">{n.body}</div>
            </div>
            <span className="text-[11px] text-slate-400 whitespace-nowrap">{formatWhen(n.created_at)}</span>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
