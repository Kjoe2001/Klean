'use client';
import { useState } from 'react';
import { useProfile } from '@/components/useProfile';
import AppShell from '@/components/AppShell';
import Locked from '@/components/Locked';
import { Icon } from '@/components/Icon';

type Tab = 'standard' | 'joynews';

function NewsFrameStudioContent() {
  const { profile, loading, plan } = useProfile();
  const [tab, setTab] = useState<Tab>('standard');

  if (loading) {
    return (
      <div className="fixed inset-0 bg-rich-black grid place-items-center">
        <div className="w-10 h-10 rounded-full border-[3px] border-caribbean-green border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  // Joynews templates are Enterprise-only. Admins / unlimited accounts keep access.
  const isEnterprise =
    plan === 'enterprise' ||
    profile.role === 'admin' ||
    profile.is_admin === true ||
    profile.unlimited_credits === true;

  const tabs: { id: Tab; label: string; locked: boolean }[] = [
    { id: 'standard', label: 'Standard', locked: false },
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

      {tab === 'joynews' && (
        isEnterprise ? (
          <div className="min-h-[calc(100vh-8rem)]">
            <iframe
              src="/news-frame-joynews.html"
              title="Zelvoo News Frame Studio — Joynews"
              className="w-full h-[calc(100vh-8rem)] rounded-[20px] border-0"
            />
          </div>
        ) : (
          <Locked feature="Joynews News Frame templates" plan="Enterprise" />
        )
      )}
    </AppShell>
  );
}

export default function NewsFrameStudioPage() {
  return <NewsFrameStudioContent />;
}
