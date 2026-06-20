'use client';
import { useState } from 'react';
import AppShell from '@/components/AppShell';
import PageHead from '@/components/PageHead';
import { NOTIFICATIONS } from '@/lib/journey';

const dot: any = { emerald: 'bg-emerald', primary: 'bg-primary', sky: 'bg-sky', secondary: 'bg-secondary' };
export default function Notifications() {
  const [list, setList] = useState(NOTIFICATIONS);
  return (
    <AppShell>
      <PageHead kicker="NOTIFICATIONS" title="Everything that needs you"
        sub="Approvals, publishes, team activity, billing and product updates — one feed." />
      <div className="flex justify-end mb-3">
        <button onClick={() => setList(list.map(n => ({ ...n, unread: false })))} className="pill !py-2">Mark all read</button>
      </div>
      <div className="glass divide-y divide-slate-100 dark:divide-white/10">
        {list.map(n => (
          <div key={n.id} onClick={() => setList(list.map(x => x.id === n.id ? { ...x, unread: false } : x))}
            className={`flex items-start gap-4 p-4 cursor-pointer transition ${n.unread ? 'bg-primary/[0.03]' : ''}`}>
            <span className="text-xl mt-0.5">{n.icon}</span>
            <div className="flex-1">
              <div className="font-semibold text-[14px] flex items-center gap-2">{n.title}{n.unread && <span className={`w-1.5 h-1.5 rounded-full ${dot[n.color]}`} />}</div>
              <div className="text-[12.5px] text-slate-500">{n.body}</div>
            </div>
            <span className="text-[11px] text-slate-400 whitespace-nowrap">{n.when}</span>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
