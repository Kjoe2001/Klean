'use client';
import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/components/useProfile';
import AppShell from '@/components/AppShell';

/* Video Download Studio wrapper.
   The studio itself is a static page in /public; this component owns the
   Supabase session and brokers every API call for it, so no access token
   ever crosses into the iframe. */

const NS = 'zelvoo-download';
const FREE_PLANS = ['trial', 'weekly'];

export default function DownloadStudioPage() {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const { profile, loading } = useProfile();

  const sendConfig = useCallback(() => {
    const plan = profile?.plan || 'trial';
    const enforceBranding = loading ? true : (!profile || FREE_PLANS.includes(plan));
    frameRef.current?.contentWindow?.postMessage(
      { ns: NS, type: 'config', enforceBranding, plan, credits: profile?.credits ?? 0 },
      window.location.origin,
    );
  }, [loading, profile]);

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
      if (!d || d.ns !== NS) return;

      const reply = (msg: Record<string, any>) =>
        frameRef.current?.contentWindow?.postMessage({ ns: NS, ...msg }, window.location.origin);

      if (d.type === 'ready') { sendConfig(); return; }

      if (d.type === 'openPricing') { window.location.href = '/pricing'; return; }

      if (d.type === 'savePreset') {
        try {
          window.localStorage.setItem('zelvoo:download-preset', JSON.stringify(d.preset ?? {}));
          reply({ reqId: d.reqId, ok: true });
        } catch {
          reply({ reqId: d.reqId, ok: false });
        }
        return;
      }

      // Everything below needs an authenticated call.
      const token = await getAccessToken();
      if (cancelled) return;
      if (!token) { reply({ reqId: d.reqId, ok: false, error: 'unauthorized' }); return; }

      const authed = (init: RequestInit = {}) => ({
        ...init,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...(init.headers || {}),
        },
      });

      try {
        if (d.type === 'createJobs') {
          const res = await fetch('/api/downloads', authed({
            method: 'POST',
            body: JSON.stringify(d.payload ?? {}),
          }));
          const payload = await res.json().catch(() => ({}));
          if (cancelled) return;
          // Credits were spent server-side; refresh the header badge.
          window.dispatchEvent(new Event('credits:changed'));
          reply({ reqId: d.reqId, ...payload });
          return;
        }

        if (d.type === 'listJobs') {
          const res = await fetch('/api/downloads', authed());
          const payload = await res.json().catch(() => ({}));
          if (cancelled) return;
          reply({ reqId: d.reqId, ok: res.ok, ...payload });
          return;
        }

        if (d.type === 'jobUrl') {
          const res = await fetch(`/api/downloads/${encodeURIComponent(d.id)}`, authed());
          const payload = await res.json().catch(() => ({}));
          if (cancelled) return;
          reply({ reqId: d.reqId, ok: res.ok, ...payload });
          return;
        }

        if (d.type === 'cancelJob') {
          const res = await fetch(`/api/downloads/${encodeURIComponent(d.id)}`, authed({ method: 'DELETE' }));
          const payload = await res.json().catch(() => ({}));
          if (cancelled) return;
          window.dispatchEvent(new Event('credits:changed'));
          reply({ reqId: d.reqId, ok: res.ok, ...payload });
          return;
        }

        if (d.type === 'uploadLogo') {
          // Custom marks live in the Brand Kit; point the user there rather than
          // accepting a second upload path with its own storage rules.
          reply({ reqId: d.reqId, ok: false, error: 'use_brand_kit' });
          return;
        }
      } catch {
        if (!cancelled) reply({ reqId: d.reqId, ok: false, error: 'network' });
      }
    };

    window.addEventListener('message', onMessage);
    return () => { cancelled = true; window.removeEventListener('message', onMessage); };
  }, [sendConfig]);

  useEffect(() => { sendConfig(); }, [sendConfig]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-rich-black grid place-items-center">
        <div className="w-10 h-10 rounded-full border-[3px] border-caribbean-green border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <AppShell
      title="Video Download Studio"
      subtitle="Paste a link, get a branded file back — straight into your library"
    >
      <div className="min-h-[calc(100vh-8rem)]">
        <iframe
          ref={frameRef}
          src="/video-download-studio.html"
          title="Zelvoo Video Download Studio"
          className="w-full h-[calc(100vh-8rem)] rounded-[20px] border-0"
          onLoad={sendConfig}
        />
      </div>
    </AppShell>
  );
}
