'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ACTIVATION } from '@/lib/journey';
import { supabase } from '@/lib/supabase';

/* Activation checklist — reads completion flags from profiles.activation (jsonb) */
export default function Activation({ profile }: any) {
  const [done, setDone] = useState<Record<string, boolean>>(profile?.activation || {});
  const [open, setOpen] = useState(true);
  useEffect(() => { setDone(profile?.activation || {}); }, [profile]);

  const complete = ACTIVATION.filter(s => done[s.id]).length;
  const pct = Math.round((complete / ACTIVATION.length) * 100);
  if (pct === 100) return null;

  const mark = async (id: string) => {
    const next = { ...done, [id]: true };
    setDone(next);
    await supabase.from('profiles').update({ activation: next }).eq('id', profile.id);
  };

  return (
    <div className="glass p-5 mb-5">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between">
        <div className="text-left">
          <div className="font-mono text-[10px] font-bold tracking-widest text-primary">GET STARTED</div>
          <div className="font-sora font-bold text-lg mt-0.5">You're {pct}% set up</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-28 h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-secondary to-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-slate-400 text-sm">{open ? '▲' : '▼'}</span>
        </div>
      </button>
      {open && (
        <div className="grid sm:grid-cols-2 gap-2 mt-4">
          {ACTIVATION.map(s => (
            <Link key={s.id} href={s.href} onClick={() => mark(s.id)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border transition hover:-translate-y-0.5 ${
                done[s.id] ? 'border-emerald/40 bg-emerald/5' : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5'}`}>
              <span className={`w-7 h-7 rounded-lg grid place-items-center text-sm ${done[s.id] ? 'bg-emerald text-white' : 'bg-slate-100 dark:bg-white/10'}`}>
                {done[s.id] ? '✓' : s.icon}</span>
              <div className="min-w-0">
                <div className={`text-[13px] font-semibold truncate ${done[s.id] ? 'text-emerald line-through' : ''}`}>{s.label}</div>
                <div className="text-[11px] text-slate-500 truncate">{s.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
