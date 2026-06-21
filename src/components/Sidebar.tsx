'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import { supabase } from '@/lib/supabase';
import { PLANS } from '@/lib/plans';

const GROUPS: { title: string; items: { href: string; icon: string; label: string }[] }[] = [
  { title: 'Create', items: [
    { href: '/dashboard', icon: '▦', label: 'Dashboard' },
    { href: '/content-studio', icon: '✦', label: 'Content Studio' },
    { href: '/image-studio', icon: '🖼', label: 'Image Studio' },
    { href: '/campaign-builder', icon: '◎', label: 'Campaign Builder' },
    { href: '/templates', icon: '◳', label: 'Templates' },
    { href: '/prompts', icon: '⌘', label: 'Saved Prompts' },
    { href: '/assistant', icon: '✲', label: 'AI Assistant' },
  ]},
  { title: 'Organise', items: [
    { href: '/brand-kit', icon: '▣', label: 'Brand Kit' },
    { href: '/assets', icon: '🖿', label: 'Asset Manager' },
    { href: '/calendar', icon: '📅', label: 'Calendar' },
    { href: '/library', icon: '🗂', label: 'Library' },
    { href: '/approvals', icon: '✓', label: 'Approvals' },
  ]},
  { title: 'Grow', items: [
    { href: '/trends', icon: '📈', label: 'Trends' },
    { href: '/competitors', icon: '🎯', label: 'Competitors' },
    { href: '/analytics', icon: '∿', label: 'Analytics' },
  ]},
  { title: 'Collaborate', items: [
    { href: '/workspaces', icon: '👥', label: 'Workspaces' },
    { href: '/clients', icon: '🤝', label: 'Clients' },
    { href: '/integrations', icon: '🔌', label: 'Integrations' },
    { href: '/white-label', icon: '🏷', label: 'White-Label' },
  ]},
  { title: 'Learn & earn', items: [
    { href: '/academy', icon: '🎓', label: 'Academy' },
    { href: '/community', icon: '◇', label: 'Community' },
    { href: '/affiliate', icon: '🎁', label: 'Affiliate' },
    { href: '/partners', icon: '🤝', label: 'Partners' },
  ]},
  { title: 'Account', items: [
    { href: '/billing', icon: '💳', label: 'Billing' },
    { href: '/security', icon: '🔒', label: 'Security & 2FA' },
    { href: '/support', icon: '☎', label: 'Support' },
    { href: '/settings', icon: '⚙', label: 'Settings' },
  ]},
];

export default function Sidebar({ profile, trialDaysLeft }: any) {
  const path = usePathname();
  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 sticky top-4 h-[calc(100vh-2rem)] glass p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4 px-1"><Logo href="/dashboard" /><ThemeToggle /></div>
      <Link href="/billing" className="block rounded-xl border border-slate-200 dark:border-white/10 px-3 py-2 mb-3 hover:shadow transition">
        <div className="font-mono text-[10px] font-bold tracking-widest text-primary">
          {profile?.plan === 'trial' ? `⏳ TRIAL · ${trialDaysLeft}D LEFT` : `✓ ${PLANS[profile?.plan]?.name?.toUpperCase()}`}
        </div>
        <div className="text-[11px] text-slate-500">{profile?.plan === 'trial' ? 'Upgrade from $19/mo →' : 'Manage plan →'}</div>
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
                      active ? 'bg-gradient-to-r from-secondary to-primary text-white font-semibold shadow-glow'
                             : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'}`}>
                    <span className="w-4 text-center">{n.icon}</span>{n.label}
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
