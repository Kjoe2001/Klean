'use client';
import Sidebar from './Sidebar';
import { useProfile } from './useProfile';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { NOTIFICATIONS } from '@/lib/journey';
import CreditsBadge from '@/components/CreditsBadge';

export default function AppShell({ children, title, subtitle, actions }: any) {
  const { profile, loading, trialDaysLeft, trialExpired } = useProfile();
  const router = useRouter();
  const unread = NOTIFICATIONS.filter(n => n.unread).length;
  useEffect(() => { if (profile && profile.onboarded === false) router.replace('/welcome'); }, [profile]);
  if (loading) return <div className="min-h-screen grid place-items-center"><div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>;
  if (!profile) return null;
  return (
    <div className="flex gap-5 max-w-[1500px] mx-auto p-4">
      <Sidebar profile={profile} trialDaysLeft={trialDaysLeft} />
      <main className="flex-1 min-w-0 animate-rise">
        {profile.plan === 'trial' && (
          <div className={`glass !rounded-2xl px-5 py-3 mb-4 flex flex-wrap items-center gap-3 ${trialExpired ? 'border-red-300' : ''}`}>
            <span>⏳</span>
            <div className="flex-1 text-[13px]">
              {trialExpired ? <b>Your trial has ended — your work is saved.</b>
                : <><b>Free trial</b> — <span className="text-secondary font-bold">{trialDaysLeft} days left</span>. Unlock all 16 content types, exports & intelligence.</>}
            </div>
            <Link href="/billing" className="cta text-xs px-5 py-2">Upgrade from $19/mo</Link>
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
