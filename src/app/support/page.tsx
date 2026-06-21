'use client';
import { useState } from 'react';
import AppShell from '@/components/AppShell';
import PageHead from '@/components/PageHead';
import { SUPPORT_FAQ } from '@/lib/journey';

export default function Support() {
  const [open, setOpen] = useState<number | null>(0);
  const [sent, setSent] = useState(false);
  return (
    <AppShell>
      <PageHead kicker="SUPPORT CENTER" title="We've got you"
        sub="Search help, browse FAQs, or open a ticket. Pro and above get priority response." />
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-2">
          {SUPPORT_FAQ.map((f, i) => (
            <div key={i} className="glass overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left font-semibold text-[14px]">
                {f.q}<span className="text-slate-400">{open === i ? '−' : '+'}</span>
              </button>
              {open === i && <div className="px-4 pb-4 text-[13.5px] text-slate-500 leading-relaxed">{f.a}</div>}
            </div>
          ))}
        </div>
        <div className="glass p-5 h-fit">
          <div className="font-sora font-bold mb-1">Open a ticket</div>
          <div className="text-[12px] text-slate-500 mb-3">Avg. first reply: under 4 hours</div>
          {sent ? (
            <div className="rounded-xl border border-emerald/30 bg-emerald/5 p-4 text-center text-[13px] text-emerald font-semibold">✓ Ticket created. We'll email you shortly.</div>
          ) : (
            <div className="space-y-2">
              <input placeholder="Subject" className="field" />
              <textarea placeholder="How can we help?" rows={4} className="field" />
              <button onClick={() => setSent(true)} className="cta w-full !py-3">Submit ticket</button>
              <div className="text-center text-[12px] text-slate-400 pt-1">or chat with <button className="text-primary font-semibold">Zelvoo Copilot →</button></div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
