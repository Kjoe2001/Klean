'use client';
import { useProfile } from '@/components/useProfile';
import AppShell from '@/components/AppShell';

function NewsFrameStudioContent() {
  const { profile, loading } = useProfile();

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
        src="/news-frame-studio.html"
        title="Zelvoo News Frame Studio"
        className="w-full h-[calc(100vh-8rem)] rounded-[20px] border-0"
      />
    </div>
  );

  return (
    <AppShell title="News Frame Studio" subtitle="Create and export news frame assets from your account">
      {shellContent}
    </AppShell>
  );
}

export default function NewsFrameStudioPage() {
  return <NewsFrameStudioContent />;
}