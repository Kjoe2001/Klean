'use client';
import { useState, useRef, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import PageHead from '@/components/PageHead';

const STARTERS = [
  'Plan a 7-day launch campaign for a new product',
  'Give me 5 scroll-stopping hooks for fitness content',
  'What should I post this week for a restaurant in Accra?',
  'Turn this trend into a campaign idea',
];

export default function Assistant() {
  const [msgs, setMsgs] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, busy]);

  const send = async (text: string) => {
    if (!text.trim() || busy) return;
    const next = [...msgs, { role: 'user', content: text }];
    setMsgs(next); setInput(''); setBusy(true);
    try {
      const r = await fetch('/api/assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: next }) });
      const d = await r.json();
      setMsgs([...next, { role: 'assistant', content: d.reply || d.error || 'Something went wrong.' }]);
    } catch { setMsgs([...next, { role: 'assistant', content: 'Network error — try again.' }]); }
    setBusy(false);
  };

  return (
    <AppShell>
      <PageHead kicker="ZELVO COPILOT" title="Your AI marketing strategist"
        sub="Ask anything — strategy, hooks, campaign ideas, audience insight. Copilot knows your brand and points you to the right module next." />
      <div className="glass p-0 flex flex-col h-[calc(100vh-13rem)] overflow-hidden">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {msgs.length === 0 && (
            <div className="h-full grid place-items-center text-center">
              <div>
                <div className="text-5xl mb-3">✲</div>
                <div className="font-sora font-bold text-lg">How can I help you grow today?</div>
                <div className="grid sm:grid-cols-2 gap-2 mt-5 max-w-xl">
                  {STARTERS.map(s => (
                    <button key={s} onClick={() => send(s)} className="text-left text-[13px] rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 hover:-translate-y-0.5 transition">{s}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed whitespace-pre-wrap ${
                m.role === 'user' ? 'bg-gradient-to-r from-secondary to-primary text-white' : 'glass'}`}>{m.content}</div>
            </div>
          ))}
          {busy && <div className="flex justify-start"><div className="glass rounded-2xl px-4 py-3 text-sm text-slate-400">Copilot is thinking…</div></div>}
          <div ref={endRef} />
        </div>
        <div className="border-t border-slate-200 dark:border-white/10 p-3 flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send(input)}
            placeholder="Ask Zelvoo Copilot…" className="field !py-3" />
          <button onClick={() => send(input)} disabled={busy} className="cta !px-6">Send</button>
        </div>
      </div>
    </AppShell>
  );
}
