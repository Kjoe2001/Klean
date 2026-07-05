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
  const quick = [
    ['/content-studio','auto_awesome','Generate content','16 types, parallel, scored'],
    ['/image-studio','image','Create images','Product shots, ads, thumbnails'],
    ['/campaign-builder','ads_click','Build a campaign','Strategy → media plan → KPIs'],
    ['/trends','trending_up','Discover trends','Ghana · Africa · Global · live'],
  ];
  return (
    <AppShell title="Dashboard" subtitle="Your AI marketing operating system at a glance.">
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
