'use client';
import { useState } from 'react';
import AppShell from '@/components/AppShell';
import PageHead from '@/components/PageHead';

const SEED = [
  { id: 1, title: 'Melcom — World Cup carousel', client: 'Melcom', by: 'Ama K.', status: 'pending', score: 87 },
  { id: 2, title: 'Pizza Hut — match-day reel', client: 'Pizza Hut', by: 'Kojo M.', status: 'pending', score: 91 },
  { id: 3, title: 'Hallab — weekend specials', client: 'Hallab', by: 'You', status: 'approved', score: 84 },
  { id: 4, title: 'LG — product launch email', client: 'LG', by: 'Fatima S.', status: 'changes', score: 78 },
];
const badge: any = { pending: 'text-secondary border-secondary/30 bg-secondary/5', approved: 'text-emerald border-emerald/30 bg-emerald/5', changes: 'text-sky border-sky/30 bg-sky/5' };

export default function Approvals() {
  const [list, setList] = useState(SEED);
  const set = (id: number, status: string) => setList(list.map(x => x.id === id ? { ...x, status } : x));
  const cols = [['pending', 'Awaiting review'], ['changes', 'Changes requested'], ['approved', 'Approved']];
  return (
    <AppShell>
      <PageHead kicker="APPROVALS" title="Review, request changes, sign off"
        sub="A shared queue between your team and clients. Nothing publishes until it's approved — with the AI score in view." />
      <div className="grid md:grid-cols-3 gap-4">
        {cols.map(([key, label]) => (
          <div key={key} className="glass p-4">
            <div className="font-sora font-bold text-sm mb-3 flex items-center justify-between">
              {label}<span className="text-slate-400 font-normal">{list.filter(x => x.status === key).length}</span>
            </div>
            <div className="space-y-3">
              {list.filter(x => x.status === key).map(x => (
                <div key={x.id} className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-bold uppercase border rounded-full px-2 py-0.5 ${badge[x.status]}`}>{x.client}</span>
                    <span className="text-[11px] text-slate-400">★ {x.score}</span>
                  </div>
                  <div className="font-semibold text-[13px]">{x.title}</div>
                  <div className="text-[11px] text-slate-500 mb-2">by {x.by}</div>
                  {x.status !== 'approved' && (
                    <div className="flex gap-1.5">
                      <button onClick={() => set(x.id, 'approved')} className="flex-1 text-[11.5px] font-bold text-emerald border border-emerald/30 rounded-lg py-1.5">Approve</button>
                      {x.status !== 'changes' && <button onClick={() => set(x.id, 'changes')} className="flex-1 text-[11.5px] font-bold text-sky border border-sky/30 rounded-lg py-1.5">Changes</button>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
