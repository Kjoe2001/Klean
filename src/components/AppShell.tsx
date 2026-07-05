'use client';
import Sidebar from './Sidebar';
import { useProfile } from './useProfile';
import Link from 'next/link';
import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { NOTIFICATIONS } from '@/lib/journey';
import { Icon } from '@/components/Icon';

export default function AppShell({ children, title, subtitle, actions }: any) {
  const { profile, loading, daysLeft, planExpired, outOfCredits, credits, plan } = useProfile();
  const router = useRouter();
  const unread = NOTIFICATIONS.filter(n => n.unread).length;

  useEffect(() => { if (profile && profile.onboarded === false) router.replace('/welcome'); }, [profile]);

  if (loading) return (
    <div className="min-h-screen bg-white grid place-items-center">
      <div className="w-10 h-10 rounded-full border-[3px] border-primary border-t-transparent animate-spin" />
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
    info:   'bg-primary/6 border-primary/20 text-[#0A0E27]',
    warn:   'bg-warning/8 border-warning/20 text-[#0A0E27]',
    danger: 'bg-danger/8 border-danger/20 text-[#0A0E27]',
  };

  // Credit pill variant
  const creditVariant = credits <= 5 ? 'danger' : credits <= 20 ? 'warning' : 'teal';
  const creditStyles = {
    teal:    'bg-teal/10 text-teal border-teal/20',
    warning: 'bg-warning/10 text-amber-700 border-warning/20',
    danger:  'bg-danger/10 text-danger border-danger/20',
  };

  return (
    <div className="flex gap-5 max-w-[1500px] mx-auto p-4 bg-[#F7F7FB] min-h-screen">
      <Sidebar profile={profile} trialDaysLeft={daysLeft} />
      <main className="flex-1 min-w-0 animate-rise">

        {/* ── Top bar ────────────────────────────────────────────── */}
        <header className="bg-white border border-[#E5E7EB] rounded-[20px] px-5 h-14 flex items-center justify-between gap-4 mb-5">
          <div>
            <h1 className="font-heading font-semibold text-[#0A0E27] text-base leading-tight">{title}</h1>
            {subtitle && <p className="text-xs text-[#6B7280] mt-0.5 hidden sm:block">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Credit balance pill */}
            <Link href="/billing"
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors hover:opacity-80 ${creditStyles[creditVariant]}`}>
              <Icon name="bolt" className="msym-sm" />
              {credits} credits
            </Link>
            {/* Top up button */}
            <Link href="/billing"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-ink text-white text-xs font-semibold hover:bg-accent transition-colors">
              Top up
            </Link>
            {/* Notifications */}
            <Link href="/notifications"
              className="relative w-9 h-9 rounded-[10px] border border-[#E5E7EB] bg-white grid place-items-center hover:border-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Notifications">
              <Icon name="notifications" className="text-[#6B7280]" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-danger text-white text-[9px] font-bold grid place-items-center">{unread}</span>
              )}
            </Link>
            {actions}
          </div>
        </header>

        {/* ── Banner ─────────────────────────────────────────────── */}
        {banner && (
          <div className={`rounded-[14px] border px-4 py-3 mb-4 flex flex-wrap items-center gap-3 text-sm ${bannerColors[banner.tone]}`}>
            <div className="flex-1 text-[13px]">{banner.node}</div>
            <Link href={banner.href}
              className="text-xs px-4 py-1.5 rounded-full bg-ink text-white font-semibold hover:bg-accent transition-colors shrink-0">
              {banner.cta}
            </Link>
          </div>
        )}

        {children}
      </main>
    </div>
  );
}
