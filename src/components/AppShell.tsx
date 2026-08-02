'use client';
import Sidebar from './Sidebar';
import { useProfile } from './useProfile';
import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Icon } from '@/components/Icon';
import TourOverlay from '@/components/TourOverlay';
import { getStandaloneContext, getStandaloneDefaultPath, isStandalonePathAllowed, withStandaloneParams } from '@/lib/auth-redirect';

async function getAccessToken() {
  let { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) return session.access_token;
  await supabase.auth.getUser();
  ({ data: { session } } = await supabase.auth.getSession());
  if (session?.access_token) return session.access_token;
  const refreshed = await supabase.auth.refreshSession();
  return refreshed.data.session?.access_token || null;
}

export default function AppShell({ children, title, subtitle, actions }: any) {
  const { profile, loading, daysLeft, planExpired, outOfCredits, credits, plan } = useProfile();
  const standaloneHref = (href: string) => withStandaloneParams(href);
  const router = useRouter();
  const pathname = usePathname();
  const standalone = getStandaloneContext();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [showTour, setShowTour] = useState(false);
  const autoTourShown = useRef(false);

  useEffect(() => { if (profile && profile.onboarded === false) router.replace('/welcome'); }, [profile]);
  useEffect(() => { setMobileOpen(false); }, [pathname]);
  useEffect(() => {
    if (!standalone.standalone) return;
    if (isStandalonePathAllowed(pathname)) return;

    router.replace(withStandaloneParams(getStandaloneDefaultPath()));
  }, [pathname, router, standalone.standalone]);

  useEffect(() => {
    if (!profile || autoTourShown.current) return;
    if (profile.activation?.tour_seen === true) return;
    if (typeof window === 'undefined' || window.innerWidth < 768) return;
    autoTourShown.current = true;
    const t = setTimeout(() => setShowTour(true), 600);
    return () => clearTimeout(t);
    // Depend only on the stable id + seen-flag, not the whole profile object —
    // useProfile() returns a new profile object on every credits refresh, which
    // was cancelling this timeout before it ever fired.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, profile?.activation?.tour_seen]);

  const closeTour = async (markSeen: boolean) => {
    setShowTour(false);
    if (markSeen && profile) {
      await supabase.from('profiles')
        .update({ activation: { ...(profile.activation || {}), tour_seen: true } })
        .eq('id', profile.id);
    }
  };
  useEffect(() => {
    let alive = true;
    (async () => {
      const token = await getAccessToken();
      if (!token) return;
      try {
        const response = await fetch('/api/notifications', { headers: { Authorization: `Bearer ${token}` } });
        const data = await response.json();
        if (alive) setUnread(Number(data?.unread || 0));
      } catch {}
    })();
    return () => { alive = false; };
  }, [pathname]);

  if (loading) return (
    <div className="min-h-screen section-light grid place-items-center">
      <div className="w-10 h-10 rounded-full border-[3px] border-caribbean-green border-t-transparent animate-spin" />
    </div>
  );
  if (!profile) return null;

  const isTrial = plan === 'trial';
  let banner: null | { tone: 'info' | 'warn' | 'danger'; node: ReactNode; cta: string; href: string } = null;
  if (planExpired) {
    banner = { tone: 'danger', href: '/billing', cta: isTrial ? 'Upgrade now' : 'Renew',
      node: <><b>{isTrial ? 'Your trial has ended' : `Your plan has expired`}</b> — your work is saved. {isTrial ? 'Upgrade' : 'Renew'} to keep creating.</> };
  } else if (outOfCredits) {
    banner = { tone: 'warn', href: '/billing', cta: 'Get more credits',
      node: <><b>You're out of credits.</b> Top up or upgrade to keep generating.</> };
  } else if (isTrial) {
    banner = { tone: 'info', href: '/billing', cta: 'Upgrade from $10',
      node: <><b>Free trial</b> — <span className="font-bold text-primary">{daysLeft} days left</span>. Unlock all 16 content types, exports & intelligence.</> };
  } else if (daysLeft <= 2) {
    banner = { tone: 'warn', href: '/billing', cta: 'Renew',
      node: <><b>Your plan</b> — <span className="font-bold text-warning">{daysLeft} day{daysLeft === 1 ? '' : 's'} left</span>. Renew to avoid interruption.</> };
  }

  const bannerColors = {
    info:   'bg-bangladesh-green/12 border-bangladesh-green/25 text-rich-black',
    warn:   'bg-warning/12 border-warning/35 text-rich-black',
    danger: 'bg-danger/12 border-danger/35 text-rich-black',
  };

  // Credit pill variant
  const creditVariant = credits <= 5 ? 'danger' : credits <= 20 ? 'warning' : 'teal';
  const creditStyles = {
    teal:    'bg-bangladesh-green/10 text-bangladesh-green border-bangladesh-green/30',
    warning: 'bg-warning/15 text-warning border-warning/35',
    danger:  'bg-danger/15 text-danger border-danger/35',
  };

  return (
    <div className="section-light min-h-screen relative text-rich-black">
      <div className="orb-fixed-light animate-orb" />
      <div className="flex gap-5 max-w-[1500px] mx-auto p-2.5 sm:p-3 md:p-4 relative z-10">
      {!standalone.standalone && (
        <Sidebar profile={profile} trialDaysLeft={daysLeft} className="hidden md:flex sticky top-4 h-[calc(100vh-2rem)]" />
      )}
      <main className="flex-1 min-w-0 animate-rise">

        {/* ── Top bar ────────────────────────────────────────────── */}
        <header className="glass-elevated-light glass-highlight rounded-[20px] px-4 md:px-5 min-h-14 py-2 flex items-center justify-between gap-3 md:gap-4 mb-5 border border-bangladesh-green/12">
          <div className="flex items-start gap-2 md:gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className={`${standalone.standalone ? '' : 'md:hidden'} w-11 h-11 rounded-xl grid place-items-center text-bangladesh-green hover:bg-bangladesh-green/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caribbean-green`}
              aria-label="Open sidebar"
            >
              <Icon name="menu" />
            </button>
            <div className="min-w-0">
            <h1 className="font-heading font-semibold text-rich-black text-sm sm:text-base leading-tight break-words">{title}</h1>
            {subtitle && <p className="text-xs text-stone mt-0.5 hidden sm:block break-words">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Credit balance pill */}
            <Link href={standaloneHref('/billing')}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors hover:opacity-80 ${creditStyles[creditVariant]}`}>
              <Icon name="bolt" className="msym-sm" />
              {credits} credits
            </Link>
            {/* Top up button */}
            <Link href={standaloneHref('/billing')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-caribbean-green text-rich-black text-xs font-medium hover:brightness-110 transition-colors">
              Top up
            </Link>
            {/* Take a tour */}
            <button
              onClick={() => setShowTour(true)}
              className="hidden md:grid w-9 h-9 rounded-[10px] border border-bangladesh-green/20 bg-white place-items-center hover:border-caribbean-green/45 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caribbean-green"
              aria-label="Take a tour"
              title="Take a tour"
            >
              <Icon name="help" className="text-bangladesh-green" />
            </button>
            {/* Notifications */}
            <Link href={standaloneHref('/notifications')}
              className="relative w-11 h-11 md:w-9 md:h-9 rounded-[10px] border border-bangladesh-green/20 bg-white grid place-items-center hover:border-caribbean-green/45 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caribbean-green"
              aria-label="Notifications">
              <Icon name="notifications" className="text-bangladesh-green" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-danger text-rich-black text-[9px] font-bold grid place-items-center">{unread}</span>
              )}
            </Link>
            {actions}
          </div>
        </header>

        {/* ── Banner ─────────────────────────────────────────────── */}
        {banner && (
          <div className={`rounded-[14px] border px-4 py-3 mb-4 flex flex-wrap items-center gap-3 text-sm ${bannerColors[banner.tone]}`}>
            <div className="flex-1 text-[13px]">{banner.node}</div>
            <Link href={standaloneHref(banner.href)}
              className="text-xs px-4 py-1.5 rounded-full bg-caribbean-green text-rich-black font-medium hover:brightness-110 transition-colors shrink-0 w-full sm:w-auto text-center">
              {banner.cta}
            </Link>
          </div>
        )}

        {children}
      </main>
      </div>

      {mobileOpen && (
        <>
          <button
            aria-label="Close sidebar"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-rich-black/50 z-40"
          />
          <Sidebar
            profile={profile}
            trialDaysLeft={daysLeft}
            onNavigate={() => setMobileOpen(false)}
            className="fixed z-50 top-2 left-2 h-[calc(100vh-1rem)] max-w-[92vw]"
          />
        </>
      )}

      <TourOverlay open={showTour} onClose={closeTour} />
    </div>
  );
}
