'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import { supabase } from '@/lib/supabase';
import { PLANS } from '@/lib/plans';
import { Icon } from '@/components/Icon';

const GROUPS: { title: string; items: { href: string; icon: string; label: string }[] }[] = [
  { title: 'Create', items: [
    { href: '/dashboard',        icon: 'space_dashboard', label: 'Dashboard' },
    { href: '/content-studio',   icon: 'auto_awesome',    label: 'Content Studio' },
    { href: '/campaign-builder', icon: 'ads_click',       label: 'Campaign Builder' },
    { href: '/templates',        icon: 'dashboard_customize', label: 'Templates' },
    { href: '/prompts',          icon: 'bookmark',        label: 'Saved Prompts' },
  ]},
  { title: 'Organise', items: [
    { href: '/brand-kit',  icon: 'palette',        label: 'Brand Kit' },
    { href: '/assets',     icon: 'perm_media',     label: 'Asset Manager' },
    { href: '/calendar',   icon: 'calendar_month', label: 'Calendar' },
    { href: '/library',    icon: 'folder_open',    label: 'Library' },
    { href: '/approvals',  icon: 'task_alt',       label: 'Approvals' },
  ]},
  { title: 'Grow', items: [
    { href: '/trends',     icon: 'trending_up', label: 'Trends' },
    { href: '/competitors',icon: 'radar',       label: 'Competitors' },
    { href: '/analytics',  icon: 'monitoring',  label: 'Analytics' },
  ]},
  { title: 'Collaborate', items: [
    { href: '/workspaces',  icon: 'groups',      label: 'Workspaces' },
    { href: '/clients',     icon: 'handshake',   label: 'Clients' },
    { href: '/integrations',icon: 'cable',       label: 'Integrations' },
    { href: '/white-label', icon: 'sell',        label: 'White-Label' },
  ]},
  { title: 'Learn & earn', items: [
    { href: '/academy',   icon: 'school',      label: 'Academy' },
    { href: '/community', icon: 'forum',       label: 'Community' },
    { href: '/affiliate', icon: 'redeem',      label: 'Affiliate' },
    { href: '/partners',  icon: 'diversity_3', label: 'Partners' },
  ]},
  { title: 'Account', items: [
    { href: '/billing',   icon: 'credit_card',  label: 'Billing' },
    { href: '/security',  icon: 'shield_lock',  label: 'Security & 2FA' },
    { href: '/support',   icon: 'support_agent',label: 'Support' },
    { href: '/settings',  icon: 'settings',     label: 'Settings' },
  ]},
];

export default function Sidebar({ profile, trialDaysLeft, className = '', onNavigate }: any) {
  const path = usePathname();
  const showAdmin = (profile?.email || '').toLowerCase() === 'oannoreric@gmail.com';
  return (
    <aside className={`flex flex-col w-60 shrink-0 section-green border border-mountain-meadow/20 rounded-[20px] p-4 overflow-y-auto ${className}`}>
      {/* Logo */}
      <div className="mb-5 px-1">
        <Link href="/dashboard" onClick={onNavigate} className="inline-flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caribbean-green rounded-lg">
          <span className="w-8 h-8 rounded-[10px] bg-caribbean-green text-rich-black grid place-items-center text-sm font-bold font-heading shadow-[0_0_18px_rgba(0,223,129,0.25)]">Z</span>
          <span className="font-heading font-semibold text-anti-flash-white text-[0.9375rem]">Zelvoo</span>
        </Link>
      </div>

      {/* Plan pill */}
      <Link href="/billing" onClick={onNavigate} className="block rounded-[12px] border border-mountain-meadow/25 bg-bangladesh-green/20 px-3 py-2.5 mb-5 hover:border-caribbean-green/40 transition-colors">
        <div className="text-[10px] font-bold tracking-[0.2em] text-caribbean-green flex items-center gap-1.5">
          <Icon name={profile?.plan === 'trial' ? 'hourglass_top' : 'check_circle'} className="text-[13px]" />
          {profile?.plan === 'trial' ? `TRIAL · ${trialDaysLeft}D LEFT` : `${PLANS[profile?.plan]?.name?.toUpperCase() ?? 'PLAN'}`}
        </div>
        <div className="text-[11px] text-pistachio mt-0.5">{profile?.plan === 'trial' ? 'Upgrade from $10 ->' : 'Manage plan ->'}</div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-4 overflow-y-auto">
        {GROUPS.map(g => (
          <div key={g.title}>
            <div className="text-[9.5px] font-bold tracking-[0.2em] text-stone px-3 mb-1">{g.title.toUpperCase()}</div>
            <div className="space-y-0.5">
              {g.items.map(n => {
                const active = path === n.href;
                return (
                  <Link key={n.href} href={n.href} onClick={onNavigate}
                    className={`flex items-center gap-3 px-3 py-2 rounded-[10px] text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caribbean-green
                      ${active
                        ? 'bg-caribbean-green text-rich-black font-semibold'
                        : 'text-pistachio hover:text-anti-flash-white hover:bg-bangladesh-green/18'}`}>
                    <Icon name={n.icon} className="w-4 text-center shrink-0" />{n.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Admin + sign out */}
      {showAdmin && (
        <Link href="/admin" onClick={onNavigate} className="mt-3 flex items-center gap-3 px-3 py-2 rounded-[10px] text-[13px] text-stone hover:text-anti-flash-white hover:bg-bangladesh-green/18 transition-colors">
          <span className="w-4 text-center text-sm">🛡</span>Admin
        </Link>
      )}
      <button onClick={async () => { await supabase.auth.signOut(); location.href = '/login'; }}
        className="mt-2 text-left flex items-center gap-3 px-3 py-2 rounded-[10px] text-[13px] text-stone hover:text-anti-flash-white hover:bg-bangladesh-green/18 transition-colors w-full">
        <Icon name="logout" className="w-4 text-center" />Sign out
      </button>
    </aside>
  );
}
