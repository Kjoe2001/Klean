'use client';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/components/useProfile';
import AppShell from '@/components/AppShell';

type Tab = 'standard' | 'duo';

function FrameStudioContent() {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const duoFrameRef = useRef<HTMLIFrameElement>(null);
  const { profile, loading } = useProfile();
  const [tab, setTab] = useState<Tab>('standard');

  const post = (msg: Record<string, any>) => {
    frameRef.current?.contentWindow?.postMessage({ ns: 'zelvoo-frame', ...msg }, window.location.origin);
  };

  const sendBrandingConfig = () => {
    const enforceBranding = loading ? true : (!profile || profile.plan === 'trial');
    post({ type: 'brandingConfig', enforceBranding });
  };

  useEffect(() => {
    let cancelled = false;

    const getAccessToken = async () => {
      let { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) return session.access_token;

      await supabase.auth.getUser();
      ({ data: { session } } = await supabase.auth.getSession());
      if (session?.access_token) return session.access_token;

      const refreshed = await supabase.auth.refreshSession();
      return refreshed.data.session?.access_token || null;
    };

    const onMessage = async (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const sourceWindow = e.source as Window | null;
      const isStandardFrame = sourceWindow === frameRef.current?.contentWindow;
      const isDuoFrame = sourceWindow === duoFrameRef.current?.contentWindow;
      if (!isStandardFrame && !isDuoFrame) return;

      const d = e.data;
      if (!d || d.ns !== 'zelvoo-frame') return;

      const reply = (msg: Record<string, any>) =>
        sourceWindow?.postMessage({ ns: 'zelvoo-frame', ...msg }, window.location.origin);

      if (d.type === 'frameReady') {
        if (isStandardFrame) sendBrandingConfig();
        return;
      }

      if (d.type === 'openPricing') {
        window.location.href = '/pricing';
        return;
      }

      if (d.type === 'chargeForSave') {
        const reqId = d.reqId;
        const token = await getAccessToken();
        if (cancelled) return;
        if (!token) {
          reply({ type: 'chargeForSaveResult', reqId, ok: false, error: 'unauthorized' });
          return;
        }

        const res = await fetch('/api/credits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ action: 'frame_video' }),
        });
        if (cancelled) return;

        const payload = await res.json().catch(() => ({}));
        if (!res.ok || !payload?.ok) {
          reply({
            type: 'chargeForSaveResult',
            reqId,
            ok: false,
            error: payload?.error || 'charge_failed',
            needed: payload?.needed,
            balance: payload?.balance,
          });
          return;
        }

        window.dispatchEvent(new Event('credits:changed'));
        reply({ type: 'chargeForSaveResult', reqId, ok: true, balance: payload.balance, spent: payload.spent });
      }
    };

    window.addEventListener('message', onMessage);
    return () => {
      cancelled = true;
      window.removeEventListener('message', onMessage);
    };
  }, [loading, profile]);

  useEffect(() => {
    if (tab === 'standard') sendBrandingConfig();
  }, [loading, profile, tab]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-rich-black grid place-items-center">
        <div className="w-10 h-10 rounded-full border-[3px] border-caribbean-green border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'standard', label: 'Standard' },
    { id: 'duo', label: 'Duo' },
  ];

  return (
    <AppShell title="Video Frame Studio" subtitle="Create and export your product assets from your account">
      <div className="flex flex-wrap gap-2 mb-5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-2 text-sm font-heading font-medium transition ${
              tab === t.id
                ? 'bg-caribbean-green text-rich-black'
                : 'border border-bangladesh-green/25 text-bangladesh-green hover:bg-bangladesh-green/10'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'standard' && (
        <div className="min-h-[calc(100vh-8rem)]">
          <iframe
            ref={frameRef}
            src="/video-frame-studio.html"
            title="Zelvoo Video Frame Studio — Standard"
            className="w-full h-[calc(100vh-8rem)] rounded-[20px] border-0"
            onLoad={sendBrandingConfig}
          />
        </div>
      )}

      {tab === 'duo' && (
        <div className="min-h-[calc(100vh-8rem)]">
          <iframe
            ref={duoFrameRef}
            src="/video-frame-duo.html"
            title="Zelvoo Video Frame Studio — Duo"
            className="w-full h-[calc(100vh-8rem)] rounded-[20px] border-0"
          />
        </div>
      )}
    </AppShell>
  );
}

export default function FrameStudioPage() {
  return <FrameStudioContent />;
}
