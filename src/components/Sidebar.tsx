'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PLANS } from '@/lib/plans';
import { Icon } from '@/components/Icon';
import { getStandaloneContext, withStandaloneParams } from '@/lib/auth-redirect';

type NavItem = { href: string; icon: string; label: string };
type NavGroup = { title: string; tour: string; items: NavItem[] };

const GROUPS: NavGroup[] = [
  { title: 'Create', tour: 'group-create', items: [
    { href: '/dashboard',        icon: 'space_dashboard', label: 'Dashboard' },
    { href: '/content-studio',   icon: 'auto_awesome',    label: 'Content Studio' },
    { href: '/creative-studio',  icon: 'image',           label: 'Creative Studio' },
    { href: '/campaign-builder', icon: 'ads_click',       label: 'Campaign Builder' },
    { href: '/frame-studio',     icon: 'movie',           label: 'Video Frame Studio' },
    { href: '/news-frame',icon: 'article',         label: 'News Frame Studio' },
    { href: '/templates',        icon: 'dashboard_customize', label: 'Templates' },
    { href: '/prompts',          icon: 'bookmark',        label: 'Saved Prompts' },
  ]},
  { title: 'Organise', tour: 'group-organise', items: [
    { href: '/brand-kit',  icon: 'palette',        label: 'Brand Kit' },
    { href: '/assets',     icon: 'perm_media',     label: 'Asset Manager' },
    { href: '/calendar',   icon: 'calendar_month', label: 'Calendar' },
    { href: '/library',    icon: 'folder_open',    label: 'Library' },
    { href: '/approvals',  icon: 'task_alt',       label: 'Approvals' },
  ]},
  { title: 'Grow', tour: 'group-grow', items: [
    { href: '/trends',     icon: 'trending_up', label: 'Trends' },
    { href: '/competitors',icon: 'radar',       label: 'Competitors' },
    { href: '/analytics',  icon: 'monitoring',  label: 'Analytics' },
  ]},
  { title: 'Collaborate', tour: 'group-collaborate', items: [
    { href: '/workspaces',  icon: 'groups',      label: 'Workspaces' },
    { href: '/clients',     icon: 'handshake',   label: 'Clients' },
    { href: '/integrations',icon: 'cable',       label: 'Integrations' },
    { href: '/white-label', icon: 'sell',        label: 'White-Label' },
  ]},
  { title: 'Learn & earn', tour: 'group-learn', items: [
    { href: '/academy',   icon: 'school',      label: 'Academy' },
    { href: '/community', icon: 'forum',       label: 'Community' },
    { href: '/affiliate', icon: 'redeem',      label: 'Affiliate' },
    { href: '/partners',  icon: 'diversity_3', label: 'Partners' },
  ]},
  { title: 'Account', tour: 'group-account', items: [
    { href: '/downloads', icon: 'download',     label: 'Downloads' },
    { href: '/billing',   icon: 'credit_card',  label: 'Billing' },
    { href: '/security',  icon: 'shield_lock',  label: 'Security & 2FA' },
    { href: '/support',   icon: 'support_agent',label: 'Support' },
    { href: '/settings',  icon: 'settings',     label: 'Settings' },
  ]},
];

const STANDALONE_MENU_GROUPS: NavGroup[] = [
  { title: 'Dashboard', tour: 'group-dashboard', items: [
    { href: '/dashboard', icon: 'space_dashboard', label: 'Dashboard' },
    { href: '/templates', icon: 'dashboard_customize', label: 'Templates' },
    { href: '/prompts', icon: 'bookmark', label: 'Saved prompts' },
  ]},
  { title: 'Organise', tour: 'group-organise', items: [
    { href: '/brand-kit', icon: 'palette', label: 'Brand Kit' },
  ]},
  { title: 'Grow', tour: 'group-grow', items: [
    { href: '/analytics', icon: 'monitoring', label: 'Analytics' },
  ]},
  { title: 'Collaborate', tour: 'group-collaborate', items: [
    { href: '/workspaces', icon: 'groups', label: 'Workspaces' },
  ]},
  { title: 'Learn & Earn', tour: 'group-learn', items: [
    { href: '/academy', icon: 'school', label: 'Academy' },
  ]},
  { title: 'Account', tour: 'group-account', items: [
    { href: '/billing', icon: 'credit_card', label: 'Account' },
  ]},
  { title: 'Studio', tour: 'group-studio', items: [
    { href: '/content-studio', icon: 'auto_awesome', label: 'Content Studio' },
    { href: '/creative-studio', icon: 'image', label: 'Creative Studio' },
    { href: '/campaign-builder', icon: 'ads_click', label: 'Campaign Builder' },
    { href: '/frame-studio', icon: 'movie', label: 'Video Frame Studio' },
    { href: '/news-frame', icon: 'article', label: 'News Frame Studio' },
  ]},
];

export default function Sidebar({ profile, trialDaysLeft, className = '', onNavigate }: any) {
  const path = usePathname();
  const [desktopMeta, setDesktopMeta] = useState<{ standalone: boolean; flavor: string } | null>(() => {
    const context = getStandaloneContext();
    if (!context.standalone) return null;
    return { standalone: true, flavor: String(context.flavor || 'frame') };
  });
  const standaloneHref = (href: string) => withStandaloneParams(href, typeof window !== 'undefined' ? window.location.search : '');
  const showAdmin = (profile?.email || '').toLowerCase() === 'oannoreric@gmail.com';

  useEffect(() => {
    let alive = true;
    const api = typeof window !== 'undefined' ? (window as any).zelvoDesktop : null;
    if (!api?.getMeta) return;
    api.getMeta()
      .then((meta: any) => {
        if (!alive) return;
        setDesktopMeta({ standalone: !!meta?.standalone, flavor: String(meta?.flavor || 'shared') });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const navGroups = useMemo(() => {
    if (!desktopMeta?.standalone) return GROUPS;
    return STANDALONE_MENU_GROUPS;
  }, [desktopMeta]);

  return (
    <aside className={`flex flex-col w-60 shrink-0 section-green border border-mountain-meadow/20 rounded-[20px] p-4 overflow-y-auto ${className}`}>
      {/* Logo */}
      <div className="mb-5 px-1">
        <Link href={standaloneHref('/dashboard')} onClick={onNavigate} className="inline-flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caribbean-green rounded-lg">
          <span className="w-8 h-8 rounded-[10px] bg-caribbean-green text-rich-black grid place-items-center text-sm font-bold font-heading shadow-[0_0_18px_rgba(0,223,129,0.25)]">Z</span>
          <span className="font-heading font-semibold text-anti-flash-white text-[0.9375rem]">Zelvoo</span>
        </Link>
      </div>

      {/* Plan pill */}
      <Link href={standaloneHref('/billing')} onClick={onNavigate} className="block rounded-[12px] border border-mountain-meadow/25 bg-bangladesh-green/20 px-3 py-2.5 mb-5 hover:border-caribbean-green/40 transition-colors">
        <div className="text-[10px] font-bold tracking-[0.2em] text-caribbean-green flex items-center gap-1.5">
          <Icon name={profile?.plan === 'trial' ? 'hourglass_top' : 'check_circle'} className="text-[13px]" />
          {profile?.plan === 'trial' ? `TRIAL · ${trialDaysLeft}D LEFT` : `${PLANS[profile?.plan]?.name?.toUpperCase() ?? 'PLAN'}`}
        </div>
        <div className="text-[11px] text-pistachio mt-0.5">{profile?.plan === 'trial' ? 'Upgrade from $10 ->' : 'Manage plan ->'}</div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-4 overflow-y-auto">
        {navGroups.map(g => (
          <div key={g.title} data-tour={g.tour}>
            <div className="text-[9.5px] font-bold tracking-[0.2em] text-stone px-3 mb-1">{g.title.toUpperCase()}</div>
            <div className="space-y-0.5">
              {g.items.map(n => {
                const active = path === n.href;
                return (
                  <Link key={n.href} href={standaloneHref(n.href)} onClick={onNavigate}
                    className={`flex items-center gap-3 px-3 py-2 rounded-[10px] text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caribbean-green min-w-0
                      ${active
                        ? 'bg-caribbean-green text-rich-black font-semibold'
                        : 'text-pistachio hover:text-anti-flash-white hover:bg-bangladesh-green/18'}`}>
                    <Icon name={n.icon} className="w-4 text-center shrink-0" /><span className="min-w-0 break-words">{n.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Admin + sign out */}
      {showAdmin && (
        <Link href={standaloneHref('/admin')} onClick={onNavigate} className="mt-3 flex items-center gap-3 px-3 py-2 rounded-[10px] text-[13px] text-stone hover:text-anti-flash-white hover:bg-bangladesh-green/18 transition-colors">
          <span className="w-4 text-center text-sm">🛡</span>Admin
        </Link>
      )}
      <button onClick={async () => { await supabase.auth.signOut(); if (typeof window === 'undefined') return; const next = `${window.location.pathname}${window.location.search}`; const nextUrl = new URL(standaloneHref('/login'), window.location.origin); nextUrl.searchParams.set('next', next); location.href = `${nextUrl.pathname}${nextUrl.search}`; }}
        className="mt-2 text-left flex items-center gap-3 px-3 py-2 rounded-[10px] text-[13px] text-stone hover:text-anti-flash-white hover:bg-bangladesh-green/18 transition-colors w-full">
        <Icon name="logout" className="w-4 text-center" />Sign out
      </button>
    </aside>
  );
}
