'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/components/useProfile';
import AppShell from '@/components/AppShell';
import Locked from '@/components/Locked';
import { Icon } from '@/components/Icon';

type Tab = 'standard' | 'ai-import' | 'joynews';

function JoynewsAccessGate({ onUnlocked }: { onUnlocked: () => void }) {
  const [checking, setChecking] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/news-frame/joynews-content', { credentials: 'include' })
      .then((res) => {
        if (!cancelled && res.ok) onUnlocked();
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [onUnlocked]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/news-frame/joynews-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        onUnlocked();
      } else {
        setError('Incorrect username or password.');
      }
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) {
    return (
      <div className="min-h-[calc(100vh-8rem)] grid place-items-center">
        <div className="w-8 h-8 rounded-full border-[3px] border-caribbean-green border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] grid place-items-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-[20px] border border-bangladesh-green/15 bg-white p-7"
      >
        <div className="flex items-center gap-2 mb-1">
          <Icon name="lock" className="text-[16px] text-bangladesh-green" />
          <h2 className="font-heading font-semibold text-lg text-rich-black">Joynews Access</h2>
        </div>
        <p className="text-sm text-stone mb-5">
          Joynews templates are restricted to authorized partners. Sign in to continue.
        </p>

        <label className="block text-xs font-medium text-bangladesh-green mb-1">Username</label>
        <input
          type="text"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-4 rounded-xl border border-bangladesh-green/25 px-3.5 py-2.5 text-sm focus:outline-none focus:border-caribbean-green"
          required
        />

        <label className="block text-xs font-medium text-bangladesh-green mb-1">Password</label>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 rounded-xl border border-bangladesh-green/25 px-3.5 py-2.5 text-sm focus:outline-none focus:border-caribbean-green"
          required
        />

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-caribbean-green text-rich-black font-heading font-medium text-sm py-2.5 disabled:opacity-60"
        >
          {submitting ? 'Checking…' : 'Unlock Joynews'}
        </button>
      </form>
    </div>
  );
}

const AI_IMPORT_BRIDGE_NS = 'zelvoo-news-frame-ai-import';

function NewsFrameStudioContent() {
  const { profile, loading, plan } = useProfile();
  const [tab, setTab] = useState<Tab>('standard');
  const [joynewsUnlocked, setJoynewsUnlocked] = useState(false);
  const aiImportFrameRef = useRef<HTMLIFrameElement>(null);

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

    // Proxies the ai-import iframe's requests through an authenticated
    // fetch here in the parent, so the iframe (a plain static HTML file)
    // never has to handle a Supabase access token itself.
    const onMessage = async (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.source !== aiImportFrameRef.current?.contentWindow) return;

      const d = e.data;
      if (!d || d.ns !== AI_IMPORT_BRIDGE_NS) return;

      const reply = (msg: Record<string, any>) =>
        (e.source as Window)?.postMessage({ ns: AI_IMPORT_BRIDGE_NS, ...msg }, window.location.origin);

      const token = await getAccessToken();
      if (cancelled) return;
      if (!token) {
        reply({ type: `${d.type}Result`, reqId: d.reqId, ok: false, error: 'unauthorized' });
        return;
      }

      if (d.type === 'analyzeCard') {
        const res = await fetch('/api/news-frame/ai-import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ imageBase64: d.imageBase64, mediaType: d.mediaType, name: d.name }),
        });
        if (cancelled) return;
        const payload = await res.json().catch(() => ({}));
        if (typeof payload?.balance === 'number') window.dispatchEvent(new Event('credits:changed'));
        reply({ type: 'analyzeCardResult', reqId: d.reqId, ok: res.ok && payload?.ok !== false, ...payload });
        return;
      }

      if (d.type === 'listFrames') {
        const res = await fetch('/api/news-frame/ai-import', { headers: { Authorization: `Bearer ${token}` } });
        if (cancelled) return;
        const payload = await res.json().catch(() => ({}));
        reply({ type: 'listFramesResult', reqId: d.reqId, ok: res.ok, ...payload });
      }
    };

    window.addEventListener('message', onMessage);
    return () => {
      cancelled = true;
      window.removeEventListener('message', onMessage);
    };
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-rich-black grid place-items-center">
        <div className="w-10 h-10 rounded-full border-[3px] border-caribbean-green border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  // Joynews templates are Enterprise-only, and additionally gated behind a
  // shared Joynews-partner credential (checked server-side in
  // /api/news-frame/joynews-auth) — Enterprise plan alone isn't enough.
  const isEnterprise =
    plan === 'enterprise' ||
    profile.role === 'admin' ||
    profile.is_admin === true ||
    profile.unlimited_credits === true;

  const tabs: { id: Tab; label: string; locked: boolean }[] = [
    { id: 'standard', label: 'Standard', locked: false },
    { id: 'ai-import', label: 'AI Import', locked: false },
    { id: 'joynews', label: 'Joynews', locked: !isEnterprise },
  ];

  return (
    <AppShell
      title="News Frame Studio"
      subtitle="Broadcast-ready news cards — standard templates for every plan, Joynews templates for Enterprise workspaces"
    >
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
            {t.locked && <Icon name="lock" className="ml-1.5 align-middle text-[13px]" />}
          </button>
        ))}
      </div>

      {tab === 'standard' && (
        <div className="min-h-[calc(100vh-8rem)]">
          <iframe
            src="/news-frame-standard.html"
            title="Zelvoo News Frame Studio — Standard"
            className="w-full h-[calc(100vh-8rem)] rounded-[20px] border-0"
          />
        </div>
      )}

      {tab === 'ai-import' && (
        <div className="min-h-[calc(100vh-8rem)]">
          <iframe
            ref={aiImportFrameRef}
            src="/news-frame-ai-import.html"
            title="Zelvoo News Frame Studio — AI Card Import"
            className="w-full h-[calc(100vh-8rem)] rounded-[20px] border-0"
          />
        </div>
      )}

      {tab === 'joynews' && (
        !isEnterprise ? (
          <Locked feature="Joynews News Frame templates" plan="Enterprise" />
        ) : joynewsUnlocked ? (
          <div className="min-h-[calc(100vh-8rem)]">
            <iframe
              src="/api/news-frame/joynews-content"
              title="Zelvoo News Frame Studio — Joynews"
              className="w-full h-[calc(100vh-8rem)] rounded-[20px] border-0"
            />
          </div>
        ) : (
          <JoynewsAccessGate onUnlocked={() => setJoynewsUnlocked(true)} />
        )
      )}
    </AppShell>
  );
}

export default function NewsFrameStudioPage() {
  return <NewsFrameStudioContent />;
}
