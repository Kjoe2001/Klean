'use client';
import { useProfile } from '@/components/useProfile';
import AppShell from '@/components/AppShell';
import Locked from '@/components/Locked';

function NewsFrameStudioContent() {
  const { profile, loading, plan } = useProfile();

  if (loading) {
    return (
      <div className="fixed inset-0 bg-rich-black grid place-items-center">
        <div className="w-10 h-10 rounded-full border-[3px] border-caribbean-green border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  // Enterprise-only module. Admins / unlimited accounts keep access.
  const isEnterprise =
    plan === 'enterprise' ||
    profile.role === 'admin' ||
    profile.is_admin === true ||
    profile.unlimited_credits === true;

  return (
    <AppShell
      title="News Frame Studio"
      subtitle="Broadcast-ready news cards for newsrooms, radio & TV — Enterprise workspaces"
    >
      {isEnterprise ? (
        <div className="min-h-[calc(100vh-8rem)]">
          <iframe
            src="/news-frame-studio.html"
            title="Zelvoo News Frame Studio"
            className="w-full h-[calc(100vh-8rem)] rounded-[20px] border-0"
          />
        </div>
      ) : (
        <Locked feature="News Frame Studio" plan="Enterprise" />
      )}
    </AppShell>
  );
}

export default function NewsFrameStudioPage() {
  return <NewsFrameStudioContent />;
}
