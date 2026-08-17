'use client';
import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/components/useProfile';
import AppShell from '@/components/AppShell';

function FrameStudioContent() {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const { profile, loading } = useProfile();

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
      if (e.source !== frameRef.current?.contentWindow) return;

      const d = e.data;
      if (!d || d.ns !== 'zelvoo-frame') return;

      if (d.type === 'frameReady') {
        sendBrandingConfig();
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
          post({ type: 'chargeForSaveResult', reqId, ok: false, error: 'unauthorized' });
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
          post({
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
        post({ type: 'chargeForSaveResult', reqId, ok: true, balance: payload.balance, spent: payload.spent });
      }
    };

    window.addEventListener('message', onMessage);
    return () => {
      cancelled = true;
      window.removeEventListener('message', onMessage);
    };
  }, [loading, profile]);

  useEffect(() => {
    sendBrandingConfig();
  }, [loading, profile]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-rich-black grid place-items-center">
        <div className="w-10 h-10 rounded-full border-[3px] border-caribbean-green border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  const shellContent = (
    <div className="min-h-[calc(100vh-8rem)]">
      <iframe
        ref={frameRef}
        src="/video-frame-studio.html"
        title="Zelvoo Video Frame Studio"
        className="w-full h-[calc(100vh-8rem)] rounded-[20px] border-0"
        onLoad={sendBrandingConfig}
      />
    </div>
  );

  return (
    <AppShell title="Video Frame Studio" subtitle="Create and export your product assets from your account">
      {shellContent}
    </AppShell>
  );
}

export default function FrameStudioPage() {
  return <FrameStudioContent />;
}
