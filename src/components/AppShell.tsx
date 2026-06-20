'use client';
import Sidebar from './Sidebar';
import { useProfile } from './useProfile';
import Link from 'next/link';
import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { NOTIFICATIONS } from '@/lib/journey';
import CreditsBadge from '@/components/CreditsBadge';

export default function AppShell({ children, title, subtitle, actions }: any) {
  const { profile, loading, daysLeft, planExpired, outOfCredits, plan } = useProfile();
  const router = useRouter();
  const unread = NOTIFICATIONS.filter(n => n.unread).length;
  useEffect(() => { if (profile && profile.onboarded === false) router.replace('/welcome'); }, [profile]);
  if (loading) return <div className="min-h-screen grid place-items-center"><div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>;
  if (!profile) return null;

  // Build one status banner that covers every plan + state
  const isTrial = plan === 'trial';
  const planName = isTrial ? 'Free trial' : plan === 'weekly' ? 'Weekly plan' : `${plan.charAt(0).toUpperCase() + plan.slice(1)} plan`;
  let banner: null | { tone: "info" | "warn" | "danger"; node: ReactNode; cta: string; href: string } = null;
  if (planExpired) {
    banner = { tone: 'danger', href: '/billing',
      cta: isTrial ? 'Upgrade now' : 'Renew',
      node: <b>{isTrial ? 'Your trial has ended' : `Your ${planName} has expired`} — your work is saved. {isTrial ? 'Upgrade' : 'Renew'} to keep creating.</b> };
  } else if (outOfCredits) {
    banner = { tone: 'warn', href: '/billing', cta: 'Get more credits',
      node: <><b>You're out of credits.</b> Top up or upgrade to keep generating.</> };
  } else if (isTrial) {
    banner = { tone: 'info', href: '/billing', cta: 'Upgrade from $10',
      node: <><b>Free trial</b> — <span className="text-secondary font-bold">{daysLeft} days left</span>. Unlock all 16 content types, exports & intelligence.</> };
  } else if (daysLeft <= 2) {
    banner = { tone: 'warn', href: '/billing', cta: plan === 'weekly' ? 'Renew $10' : 'Manage plan',
      node: <><b>{planName}</b> — <span className="text-secondary font-bold">{daysLeft} day{daysLeft === 1 ? '' : 's'} left</span>. Renew to avoid interruption.</> };
  }

  return (
    <div className="flex gap-5 max-w-[1500px] mx-auto p-4">
      <Sidebar profile={profile} trialDaysLeft={daysLeft} />
      <main className="flex-1 min-w-0 animate-rise">
        {banner && (
          <div className={`glass !rounded-2xl px-5 py-3 mb-4 flex flex-wrap items-center gap-3 ${banner.tone === 'danger' ? 'border-red-300' : banner.tone === 'warn' ? 'border-amber-300' : ''}`}>
            <span>{banner.tone === 'danger' ? '🔒' : banner.tone === 'warn' ? '⚡' : '⏳'}</span>
            <div className="flex-1 text-[13px]">{banner.node}</div>
            <Link href={banner.href} className="cta text-xs px-5 py-2">{banner.cta}</Link>
          </div>
        )}
        <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
          <div>
            <h1 className="font-sora font-extrabold text-2xl">{title}</h1>
            {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            <CreditsBadge />
            <Link href="/notifications" className="relative glass !rounded-xl w-10 h-10 grid place-items-center hover:shadow-glow transition" title="Notifications">
              <span>🔔</span>
              {unread > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-secondary text-white text-[9px] font-bold grid place-items-center">{unread}</span>}
            </Link>
            {actions}
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
