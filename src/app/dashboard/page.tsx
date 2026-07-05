'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { supabase } from '@/lib/supabase';
import Activation from '@/components/Activation';
import { Icon } from '@/components/Icon';
import { useProfile } from '@/components/useProfile';

export default function Dashboard() {
  const { profile } = useProfile();
  const [stats, setStats] = useState<any>({});
  useEffect(() => { (async () => {
    const { data: { user } } = await supabase.auth.getUser(); if (!user) return;
    const [c, i, k, b] = await Promise.all([
      supabase.from('content').select('id', { count: 'exact', head: true }),
      supabase.from('images').select('id', { count: 'exact', head: true }),
      supabase.from('campaigns').select('id', { count: 'exact', head: true }),
      supabase.from('brands').select('id', { count: 'exact', head: true }),
    ]);
    setStats({ content: c.count || 0, images: i.count || 0, campaigns: k.count || 0, brands: b.count || 0 });
  })(); }, []);
  const firstName = profile?.name?.split(' ')[0] || profile?.email?.split('@')[0] || 'there';
  const quick = [
    ['/content-studio','auto_awesome','Generate content','16 types, parallel, scored'],
    ['/image-studio','image','Create images','Product shots, ads, thumbnails'],
    ['/campaign-builder','ads_click','Build a campaign','Strategy → media plan → KPIs'],
    ['/trends','trending_up','Discover trends','Ghana · Africa · Global · live'],
  ];
  const starterSteps = [
    { href: '/brand-kit', icon: 'palette', title: 'Set your Brand Kit', desc: 'Drop in your logo, colors and voice so every asset feels on-brand.' },
    { href: '/content-studio', icon: 'auto_awesome', title: 'Generate your first pack', desc: 'Turn one brief into hooks, captions and images in under a minute.' },
  ];
  return (
    <AppShell title="Dashboard" subtitle="Your AI marketing operating system at a glance.">
      <div className="glass p-6 mb-6 rounded-3xl border border-primary/10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] font-bold tracking-[0.25em] text-primary">WELCOME BACK</div>
            <h2 className="font-sora font-bold text-xl mt-1">Hi {firstName} — the fastest path is to start with one brief.</h2>
            <p className="text-sm text-slate-500 mt-2">Choose a starting point below and let Zelvoo turn it into a polished marketing sprint.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/brand-kit" className="rounded-full bg-brand-gradient px-4 py-2 text-sm font-sora font-bold text-white hover:-translate-y-0.5 transition">Set Brand Kit</Link>
            <Link href="/content-studio" className="rounded-full border border-slate-200 dark:border-white/10 px-4 py-2 text-sm font-sora font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition">Generate content</Link>
          </div>
        </div>
        <div className="mt-5 grid md:grid-cols-2 gap-3">
          {starterSteps.map(step => (
            <Link key={step.href} href={step.href} className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 p-4 transition hover:-translate-y-0.5 hover:shadow-glow">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-gradient text-white">
                  <Icon name={step.icon as string} className="text-[18px]" />
                </span>
                <div>
                  <div className="font-sora font-bold text-[14px]">{step.title}</div>
                  <div className="text-sm text-slate-500 mt-0.5">{step.desc}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      {profile && <Activation profile={profile} />}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[['Content pieces', stats.content, true],['AI images', stats.images, false],['Campaigns', stats.campaigns, false],['Brands', stats.brands, false]].map(([l,v,featured]) => (
          <div key={l as string} className={featured ? 'feature-card p-5' : 'glass p-5'}>
            <div className={`font-sora font-extrabold text-3xl ${featured ? 'text-white' : 'grad-text'}`}>{v ?? '—'}</div>
            <div className={`text-xs font-semibold mt-1 ${featured ? 'feature-muted' : 'text-slate-500'}`}>{l}</div>
          </div>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {quick.map(([href,icon,t,d]) => (
          <Link key={href as string} href={href as string} className="glass p-6 hover:-translate-y-1 hover:shadow-glow transition block">
            <Icon name={icon as string} className="text-primary text-[26px]" />
            <div className="font-sora font-bold mt-2">{t}</div>
            <div className="text-sm text-slate-500">{d}</div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
