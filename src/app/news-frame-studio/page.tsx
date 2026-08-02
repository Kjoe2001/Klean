'use client';
import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { useProfile } from '@/components/useProfile';
import AppShell from '@/components/AppShell';
import { getStandaloneContext } from '@/lib/auth-redirect';

function NewsFrameStudioContent() {
  const isStandalone = getStandaloneContext().standalone;
  const { profile, loading } = useProfile(isStandalone);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-rich-black grid place-items-center">
        <div className="w-10 h-10 rounded-full border-[3px] border-caribbean-green border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  const shellContent = (
    <div className={isStandalone ? 'min-h-[calc(100vh-8rem)]' : 'fixed inset-0 bg-rich-black'}>
      {!isStandalone && (
        <>
          <div className="md:hidden fixed top-0 left-0 right-0 z-[10000] bg-rich-black/90 backdrop-blur border-b border-mountain-meadow/25 px-3 pt-[max(env(safe-area-inset-top),0.5rem)] pb-2">
            <div className="flex items-center justify-between gap-2 min-w-0">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-full bg-bangladesh-green/25 text-anti-flash-white text-xs font-medium px-3 py-2 hover:brightness-110 transition shrink-0"
              >
                <Icon name="arrow_back" className="text-sm" /> Back
              </Link>
              <p className="text-xs font-heading text-pistachio truncate">News Frame Studio</p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="hidden md:inline-flex fixed top-3 left-3 z-[10000] items-center gap-1.5 rounded-full bg-rich-black text-anti-flash-white text-xs font-medium px-3.5 py-2 shadow-lg hover:brightness-110 transition"
          >
            <Icon name="arrow_back" className="text-sm" /> Zelvoo
          </Link>
        </>
      )}
      <iframe
        src="/news-frame-studio.html"
        title="Zelvoo News Frame Studio"
        className={isStandalone ? 'w-full h-[calc(100vh-8rem)] rounded-[20px] border-0' : 'w-full h-full border-0 pt-[3.75rem] md:pt-0'}
      />
    </div>
  );

  if (isStandalone) {
    return (
      <AppShell title="News Frame Studio" subtitle="Create and export news frame assets from your account">
        {shellContent}
      </AppShell>
    );
  }

  return shellContent;
}

export default function NewsFrameStudioPage() {
  return <NewsFrameStudioContent />;
}