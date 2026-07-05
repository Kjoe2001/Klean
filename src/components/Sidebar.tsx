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
    { href: '/image-studio',     icon: 'image',           label: 'Image Studio' },
    { href: '/campaign-builder', icon: 'ads_click',       label: 'Campaign Builder' },
    { href: '/templates',        icon: 'dashboard_customize', label: 'Templates' },
    { href: '/prompts',          icon: 'bookmark',        label: 'Saved Prompts' },
    { href: '/assistant',        icon: 'smart_toy',       label: 'AI Assistant' },
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

export default function Sidebar({ profile, trialDaysLeft }: any) {
  const path = usePathname();
  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 sticky top-4 h-[calc(100vh-2rem)] bg-ink rounded-[20px] p-4 overflow-y-auto">
      {/* Logo */}
      <div className="mb-5 px-1">
        <Link href="/dashboard" className="inline-flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
          <span className="w-8 h-8 rounded-[10px] bg-white/10 text-white grid place-items-center text-sm font-bold font-heading">Z</span>
          <span className="font-heading font-bold text-white text-[0.9375rem]">Zelvoo</span>
        </Link>
      </div>

      {/* Plan pill */}
      <Link href="/billing" className="block rounded-[12px] border border-white/10 bg-white/5 px-3 py-2.5 mb-5 hover:bg-white/10 transition-colors">
        <div className="text-[10px] font-bold tracking-[0.2em] text-primary flex items-center gap-1.5">
          <Icon name={profile?.plan === 'trial' ? 'hourglass_top' : 'check_circle'} className="text-[13px]" />
          {profile?.plan === 'trial' ? `TRIAL · ${trialDaysLeft}D LEFT` : `${PLANS[profile?.plan]?.name?.toUpperCase() ?? 'PLAN'}`}
        </div>
        <div className="text-[11px] text-white/40 mt-0.5">{profile?.plan === 'trial' ? 'Upgrade from $10 →' : 'Manage plan →'}</div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-4 overflow-y-auto">
        {GROUPS.map(g => (
          <div key={g.title}>
            <div className="text-[9.5px] font-bold tracking-[0.2em] text-white/30 px-3 mb-1">{g.title.toUpperCase()}</div>
            <div className="space-y-0.5">
              {g.items.map(n => {
                const active = path === n.href;
                return (
                  <Link key={n.href} href={n.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-[10px] text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
                      ${active
                        ? 'bg-primary text-white font-semibold'
                        : 'text-white/60 hover:text-white hover:bg-white/8'}`}>
                    <Icon name={n.icon} className="w-4 text-center shrink-0" />{n.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Admin + sign out */}
      {(profile?.role === 'admin' || profile?.is_admin) && (
        <Link href="/admin" className="mt-3 flex items-center gap-3 px-3 py-2 rounded-[10px] text-[13px] text-white/50 hover:text-white hover:bg-white/8 transition-colors">
          <span className="w-4 text-center text-sm">🛡</span>Admin
        </Link>
      )}
      <button onClick={async () => { await supabase.auth.signOut(); location.href = '/login'; }}
        className="mt-2 text-left flex items-center gap-3 px-3 py-2 rounded-[10px] text-[13px] text-white/40 hover:text-white hover:bg-white/8 transition-colors w-full">
        <Icon name="logout" className="w-4 text-center" />Sign out
      </button>
    </aside>
  );
}


const GROUPS: { title: string; items: { href: string; icon: string; label: string }[] }[] = [
  { title: 'Create', items: [
    { href: '/dashboard', icon: 'space_dashboard', label: 'Dashboard' },
    { href: '/content-studio', icon: 'auto_awesome', label: 'Content Studio' },
    { href: '/image-studio', icon: 'image', label: 'Image Studio' },
    { href: '/campaign-builder', icon: 'ads_click', label: 'Campaign Builder' },
    { href: '/templates', icon: 'dashboard_customize', label: 'Templates' },
    { href: '/prompts', icon: 'bookmark', label: 'Saved Prompts' },
    { href: '/assistant', icon: 'smart_toy', label: 'AI Assistant' },
  ]},
  { title: 'Organise', items: [
    { href: '/brand-kit', icon: 'palette', label: 'Brand Kit' },
    { href: '/assets', icon: 'perm_media', label: 'Asset Manager' },
    { href: '/calendar', icon: 'calendar_month', label: 'Calendar' },
    { href: '/library', icon: 'folder_open', label: 'Library' },
    { href: '/approvals', icon: 'task_alt', label: 'Approvals' },
  ]},
  { title: 'Grow', items: [
    { href: '/trends', icon: 'trending_up', label: 'Trends' },
    { href: '/competitors', icon: 'radar', label: 'Competitors' },
    { href: '/analytics', icon: 'monitoring', label: 'Analytics' },
  ]},
  { title: 'Collaborate', items: [
    { href: '/workspaces', icon: 'groups', label: 'Workspaces' },
    { href: '/clients', icon: 'handshake', label: 'Clients' },
    { href: '/integrations', icon: 'cable', label: 'Integrations' },
    { href: '/white-label', icon: 'sell', label: 'White-Label' },
  ]},
  { title: 'Learn & earn', items: [
    { href: '/academy', icon: 'school', label: 'Academy' },
    { href: '/community', icon: 'forum', label: 'Community' },
    { href: '/affiliate', icon: 'redeem', label: 'Affiliate' },
    { href: '/partners', icon: 'diversity_3', label: 'Partners' },
  ]},
  { title: 'Account', items: [
    { href: '/billing', icon: 'credit_card', label: 'Billing' },
    { href: '/security', icon: 'shield_lock', label: 'Security & 2FA' },
    { href: '/support', icon: 'support_agent', label: 'Support' },
    { href: '/settings', icon: 'settings', label: 'Settings' },
  ]},
];

export default function Sidebar({ profile, trialDaysLeft }: any) {
  const path = usePathname();
  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 sticky top-4 h-[calc(100vh-2rem)] glass p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4 px-1"><Logo href="/dashboard" /><ThemeToggle /></div>
      <Link href="/billing" className="block rounded-xl border border-slate-200 dark:border-white/10 px-3 py-2 mb-3 hover:shadow transition">
        <div className="font-mono text-[10px] font-bold tracking-widest text-primary flex items-center gap-1">
          <Icon name={profile?.plan === 'trial' ? 'hourglass_top' : 'check_circle'} className="text-[13px]" />
          {profile?.plan === 'trial' ? `TRIAL · ${trialDaysLeft}D LEFT` : `${PLANS[profile?.plan]?.name?.toUpperCase()}`}
        </div>
        <div className="text-[11px] text-slate-500">{profile?.plan === 'trial' ? 'Upgrade from $10 →' : 'Manage plan →'}</div>
      </Link>
      <nav className="flex-1 space-y-3">
        {GROUPS.map(g => (
          <div key={g.title}>
            <div className="font-mono text-[9.5px] font-bold tracking-[.18em] text-slate-400 px-3 mb-1">{g.title.toUpperCase()}</div>
            <div className="space-y-0.5">
              {g.items.map(n => {
                const active = path === n.href;
                return (
                  <Link key={n.href} href={n.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] transition ${
                      active ? 'bg-brand-gradient text-white font-semibold shadow-glow'
                             : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'}`}>
                    <Icon name={n.icon} className="w-4 text-center" />{n.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      {(profile?.role === 'admin' || profile?.is_admin) && (
        <Link href="/admin" className="mt-3 flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5">
          <span className="w-4 text-center">🛡</span>Admin
        </Link>)}
      <button onClick={async () => { await supabase.auth.signOut(); location.href = '/login'; }}
        className="mt-2 text-left flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5">
        <span className="w-4 text-center">⏻</span>Sign out
      </button>
    </aside>
  );
}
