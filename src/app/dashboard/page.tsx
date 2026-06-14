'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
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
    ['/content-studio','✦','Generate content','16 types, parallel, scored'],
    ['/image-studio','🖼','Create images','Product shots, ads, thumbnails'],
    ['/campaign-builder','◎','Build a campaign','Strategy → media plan → KPIs'],
    ['/trends','📈','Discover trends','Ghana · Africa · Global · live'],
  ];
  return (
    <AppShell title="Dashboard" subtitle="Your AI marketing operating system at a glance.">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[['Content pieces', stats.content],['AI images', stats.images],['Campaigns', stats.campaigns],['Brands', stats.brands]].map(([l,v]) => (
          <div key={l as string} className="glass p-5">
            <div className="font-sora font-extrabold text-3xl grad-text">{v ?? '—'}</div>
            <div className="text-xs font-semibold text-slate-500 mt-1">{l}</div>
          </div>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {quick.map(([href,icon,t,d]) => (
          <Link key={href as string} href={href as string} className="glass p-6 hover:-translate-y-1 hover:shadow-glow transition block">
            <div className="text-2xl">{icon}</div>
            <div className="font-sora font-bold mt-2">{t}</div>
            <div className="text-sm text-slate-500">{d}</div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
