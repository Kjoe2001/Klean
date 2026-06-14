'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import { supabase } from '@/lib/supabase';
import { PLANS } from '@/lib/plans';

const NAV = [
  { href: '/dashboard', icon: '▦', label: 'Dashboard' },
  { href: '/content-studio', icon: '✦', label: 'Content Studio' },
  { href: '/campaign-builder', icon: '◎', label: 'Campaign Builder' },
  { href: '/image-studio', icon: '🖼', label: 'Image Studio' },
  { href: '/brand-kit', icon: '▣', label: 'Brand Kit' },
  { href: '/calendar', icon: '📅', label: 'Content Calendar' },
  { href: '/library', icon: '🗂', label: 'Content Library' },
  { href: '/trends', icon: '📈', label: 'Trends' },
  { href: '/competitors', icon: '🎯', label: 'Competitors' },
  { href: '/analytics', icon: '∿', label: 'Analytics' },
  { href: '/workspaces', icon: '👥', label: 'Workspaces' },
  { href: '/clients', icon: '🤝', label: 'Clients' },
  { href: '/billing', icon: '💳', label: 'Billing' },
  { href: '/settings', icon: '⚙', label: 'Settings' },
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
      <nav className="flex-1 space-y-0.5">
        {NAV.map(n => (
          <Link key={n.href} href={n.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] transition ${
              path.startsWith(n.href) ? 'bg-gradient-to-r from-secondary to-primary text-white font-bold shadow-glow'
              : 'text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'}`}>
            <span>{n.icon}</span>{n.label}
          </Link>
        ))}
        {profile?.role === 'admin' && (
          <Link href="/admin" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] ${path.startsWith('/admin') ? 'bg-ink text-white font-bold' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}>📊 Admin</Link>
        )}
      </nav>
      <div className="border-t border-slate-200 dark:border-white/10 pt-3 mt-3 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-primary text-white grid place-items-center font-sora font-bold text-sm">
          {profile?.name?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold truncate">{profile?.name}</div>
          <div className="text-[10px] text-slate-500 truncate">{profile?.email}</div>
        </div>
        <button className="text-[11px] text-slate-400 underline" onClick={async () => { await supabase.auth.signOut(); location.href = '/'; }}>Out</button>
      </div>
    </aside>
  );
}
