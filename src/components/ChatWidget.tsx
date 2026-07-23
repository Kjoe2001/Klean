'use client';
import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/Icon';
import { supabase } from '@/lib/supabase';

type Msg = { role: 'user' | 'assistant'; content: string };

const GREETING: Msg = {
  role: 'assistant',
  content: "Hi! I'm the Zelvoo assistant. Ask me about plans, credits, payments, or anything else — I'll do my best, and I can loop in the team if you'd rather speak to a person.",
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [visitorEmail, setVisitorEmail] = useState('');
  const [awaitingEmail, setAwaitingEmail] = useState(false);
  const [pendingEscalation, setPendingEscalation] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) setVisitorEmail(data.user.email);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, awaitingEmail, busy]);

  const send = async (history: Msg[], email?: string) => {
    setBusy(true);
    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          visitorEmail: email || visitorEmail || undefined,
          pageUrl: typeof window !== 'undefined' ? window.location.pathname : undefined,
        }),
      });
      const j = await r.json();
      if (j.error) {
        setMessages(m => [...m, { role: 'assistant', content: "Sorry, I'm having trouble responding right now. Please try again shortly." }]);
        return;
      }
      setMessages(m => [...m, { role: 'assistant', content: j.reply }]);
      if (j.escalated) {
        if (email || visitorEmail) {
          setMessages(m => [...m, { role: 'assistant', content: `Thanks — our team will follow up at ${email || visitorEmail} shortly.` }]);
        } else {
          setPendingEscalation(true);
          setAwaitingEmail(true);
        }
      }
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: "Sorry, I'm having trouble responding right now. Please try again shortly." }]);
    } finally {
      setBusy(false);
    }
  };

  const submit = () => {
    const text = input.trim();
    if (!text || busy) return;

    if (awaitingEmail) {
      const email = text;
      setVisitorEmail(email);
      setAwaitingEmail(false);
      setInput('');
      const next: Msg[] = [...messages, { role: 'user', content: email }];
      setMessages(next);
      if (pendingEscalation) {
        setPendingEscalation(false);
        setBusy(true);
        fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages, visitorEmail: email, pageUrl: window.location.pathname, forceEscalate: true }),
        })
          .then(r => r.json())
          .then(() => setMessages(m => [...m, { role: 'assistant', content: `Thanks — our team will follow up at ${email} shortly.` }]))
          .finally(() => setBusy(false));
      }
      return;
    }

    const next: Msg[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    send(next);
  };

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close chat' : 'Open chat'}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-caribbean-green text-rich-black grid place-items-center shadow-[0_4px_24px_rgba(0,223,129,0.4)] hover:brightness-110 transition-all hover:scale-105"
      >
        <Icon name={open ? 'close' : 'chat_bubble'} className="text-2xl" />
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-[calc(100vw-2.5rem)] max-w-[360px] h-[480px] max-h-[70vh] glass-elevated glass-highlight rounded-[20px] flex flex-col overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-mountain-meadow/15 shrink-0">
            <span className="w-8 h-8 rounded-[10px] bg-caribbean-green text-rich-black grid place-items-center text-sm font-bold font-heading">Z</span>
            <div>
              <p className="font-heading font-semibold text-anti-flash-white text-sm">Zelvoo Assistant</p>
              <p className="text-[11px] text-pistachio">Usually replies instantly</p>
            </div>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-[14px] px-3.5 py-2.5 text-[13px] leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-caribbean-green text-rich-black'
                    : 'bg-rich-black/30 text-anti-flash-white border border-mountain-meadow/15'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="rounded-[14px] px-3.5 py-2.5 bg-rich-black/30 border border-mountain-meadow/15">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-caribbean-green border-t-transparent animate-spin inline-block" />
                </div>
              </div>
            )}
            {awaitingEmail && (
              <p className="text-[11px] text-pistachio px-1">What&apos;s the best email to reach you at?</p>
            )}
          </div>

          <div className="p-3 border-t border-mountain-meadow/15 flex items-center gap-2 shrink-0">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder={awaitingEmail ? 'you@example.com' : 'Type a message…'}
              type={awaitingEmail ? 'email' : 'text'}
              className="field flex-1 !py-2.5 !text-[13px]"
              disabled={busy}
            />
            <button
              onClick={submit}
              disabled={busy || !input.trim()}
              aria-label="Send"
              className="w-10 h-10 rounded-full bg-caribbean-green text-rich-black grid place-items-center shrink-0 disabled:opacity-40 hover:brightness-110 transition"
            >
              <Icon name="send" className="text-lg" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
