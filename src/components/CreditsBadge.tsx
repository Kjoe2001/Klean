'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCredits } from '@/lib/credits';
import { PLANS } from '@/lib/plans';

/* Shows remaining credits. Listens for a window event so generations update it live. */
export default function CreditsBadge() {
  const [c, setC] = useState<{ plan: string; credits: number } | null>(null);
  const load = () => getCredits().then(setC);
  useEffect(() => {
    load();
    const h = () => load();
    window.addEventListener('credits:changed', h);
    return () => window.removeEventListener('credits:changed', h);
  }, []);
  if (!c) return null;
  const total = PLANS[c.plan as keyof typeof PLANS]?.credits || 1;
  const pct = Math.max(0, Math.min(100, (c.credits / total) * 100));
  const low = c.credits <= total * 0.2;
  return (
    <Link href="/billing" className="glass !rounded-xl px-3 py-2 flex items-center gap-2.5 hover:shadow-glow transition" title="Credits remaining">
      <span className="text-base">⚡</span>
      <div>
        <div className={`text-[13px] font-bold leading-none ${low ? 'text-secondary' : 'text-primary'}`}>{c.credits} <span className="text-[10px] font-normal text-slate-400">credits</span></div>
        <div className="w-20 h-1.5 rounded-full bg-slate-200 dark:bg-white/10 mt-1 overflow-hidden">
          <div className={`h-full ${low ? 'bg-secondary' : 'bg-gradient-to-r from-secondary to-primary'}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
      {low && <span className="text-[10px] font-bold text-secondary">Top up →</span>}
    </Link>
  );
}
