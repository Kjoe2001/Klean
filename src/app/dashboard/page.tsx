'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { supabase } from '@/lib/supabase';
import Activation from '@/components/Activation';
import { Icon } from '@/components/Icon';
import { useProfile } from '@/components/useProfile';
import AppImage from '@/components/AppImage';
import { MARKETING_IMAGES } from '@/lib/marketing-images';
import FrameTourOverlay from '@/components/FrameTourOverlay';

export default function Dashboard() {
  const { profile } = useProfile();
  const [stats, setStats] = useState<any>({});
  const [showFrameTour, setShowFrameTour] = useState(false);
  useEffect(() => { (async () => {
    const { data: { user } } = await supabase.auth.getUser(); if (!user) return;
    const [i, k, b, profileRes] = await Promise.all([
      supabase.from('images').select('id', { count: 'exact', head: true }),
      supabase.from('campaigns').select('id', { count: 'exact', head: true }),
      supabase.from('brands').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('activation').eq('id', user.id).single(),
    ]);
    let generatedCount = 0;
    if (!profileRes.error) {
      const activation = (profileRes.data?.activation && typeof profileRes.data.activation === 'object') ? profileRes.data.activation : {};
      generatedCount = Array.isArray((activation as any).generated_items) ? (activation as any).generated_items.length : 0;
    } else {
      const meta = (user.user_metadata && typeof user.user_metadata === 'object') ? user.user_metadata : {};
      generatedCount = Array.isArray((meta as any).generated_items) ? (meta as any).generated_items.length : 0;
    }
    setStats({ content: generatedCount, images: i.count || 0, campaigns: k.count || 0, brands: b.count || 0 });
  })(); }, []);
  useEffect(() => {
    if (!profile) return;
    if (profile.activation?.tour_seen !== true) return;
    if (profile.activation?.frame_tour_seen === true) return;
    if (typeof window === 'undefined' || window.innerWidth < 768) return;
    const t = setTimeout(() => setShowFrameTour(true), 900);
    return () => clearTimeout(t);
  }, [profile?.id, profile?.activation?.tour_seen, profile?.activation?.frame_tour_seen]);

  const closeFrameTour = async (markSeen: boolean) => {
    setShowFrameTour(false);
    if (!markSeen || !profile) return;
    await supabase
      .from('profiles')
      .update({ activation: { ...(profile.activation || {}), frame_tour_seen: true } })
      .eq('id', profile.id);
  };

  const firstName = profile?.name?.split(' ')[0] || profile?.email?.split('@')[0] || 'there';
  const quick = [
    ['/content-studio','auto_awesome','Generate content','16 types, parallel, scored'],
    ['/campaign-builder','ads_click','Build a campaign','Strategy → media plan → KPIs'],
    ['/frame-studio','movie','Frame a video','Format, style, captions, stickers, export'],
    ['/trends','trending_up','Discover trends','Ghana · Africa · Global · live'],
  ];
  const starterSteps = [
    { href: '/brand-kit', icon: 'palette', title: 'Set your Brand Kit', desc: 'Drop in your logo, colors and voice so every asset feels on-brand.' },
    { href: '/content-studio', icon: 'auto_awesome', title: 'Generate your first pack', desc: 'Turn one brief into hooks, captions and images in under a minute.' },
  ];
  return (
    <AppShell title="Dashboard" subtitle="Your AI marketing operating system at a glance.">
      <div className="glass-card-light glass-highlight p-6 mb-6 rounded-3xl border border-bangladesh-green/15" data-frame-tour="frame-dashboard-header">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] font-bold tracking-[0.25em] text-bangladesh-green">WELCOME BACK</div>
            <h2 className="font-heading font-semibold text-xl mt-1 text-rich-black break-words">Hi {firstName} - the fastest path is to start with one brief.</h2>
            <p className="text-sm text-stone mt-2">Choose a starting point below and let Zelvoo turn it into a polished marketing sprint.</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowFrameTour(true)}
              className="rounded-full border border-bangladesh-green/25 px-4 py-2 text-sm font-heading font-medium text-bangladesh-green hover:bg-bangladesh-green/10 transition w-full sm:w-auto"
            >
              Frame walkthrough
            </button>
            <Link href="/brand-kit" className="rounded-full bg-caribbean-green px-4 py-2 text-sm font-heading font-medium text-rich-black hover:brightness-110 hover:-translate-y-0.5 transition w-full sm:w-auto text-center">Set Brand Kit</Link>
            <Link href="/content-studio" className="rounded-full border border-bangladesh-green/25 px-4 py-2 text-sm font-heading font-medium text-bangladesh-green hover:bg-bangladesh-green/10 transition w-full sm:w-auto text-center">Generate content</Link>
          </div>
        </div>
        <div className="mt-5 grid md:grid-cols-2 gap-3">
          {starterSteps.map(step => (
            <Link key={step.href} href={step.href} className="rounded-2xl border border-bangladesh-green/20 bg-white p-4 transition hover:-translate-y-0.5 hover:border-caribbean-green/40">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-caribbean-green text-rich-black">
                  <Icon name={step.icon as string} className="text-[18px]" />
                </span>
                <div className="min-w-0">
                  <div className="font-heading font-medium text-[14px] text-rich-black">{step.title}</div>
                  <div className="text-sm text-stone mt-0.5 break-words">{step.desc}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      {profile && <Activation profile={profile} />}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[['Content pieces', stats.content, true],['AI images', stats.images, false],['Campaigns', stats.campaigns, false],['Brands', stats.brands, false]].map(([l,v,featured]) => (
          <div key={l as string} className={featured ? 'feature-card p-5' : 'glass-card-light glass-highlight p-5'}>
            <div className={`font-heading font-semibold text-3xl ${featured ? 'text-anti-flash-white' : 'text-bangladesh-green'}`}>{v ?? '-'}</div>
            <div className={`text-xs font-medium mt-1 ${featured ? 'feature-muted' : 'text-stone'}`}>{l}</div>
          </div>
        ))}
      </div>

      {Number(stats.content || 0) === 0 && (
        <div className="glass-card-light glass-highlight p-4 md:p-6 mb-6 rounded-3xl">
          <div className="grid md:grid-cols-[1fr_280px] gap-4 items-center">
            <div>
              <p className="font-heading text-lg text-rich-black">No content yet. Start with your first campaign brief.</p>
              <p className="text-sm text-stone mt-1">Generate hooks, posts, and visuals in one pass, then store everything in your library.</p>
            </div>
            <AppImage
              src={MARKETING_IMAGES.dashboardEmpty}
              alt="Small team celebrating while reviewing generated marketing ideas"
              width={900}
              height={620}
              sizes="(max-width: 768px) 100vw, 280px"
            />
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {quick.map(([href,icon,t,d]) => (
          <Link
            key={href as string}
            href={href as string}
            data-frame-tour={href === '/frame-studio' ? 'frame-quick-card' : undefined}
            className="glass-card-light glass-highlight p-6 hover:-translate-y-1 hover:border-caribbean-green/45 transition block"
          >
            <Icon name={icon as string} className="text-caribbean-green text-[26px]" />
            <div className="font-heading font-medium mt-2 text-rich-black">{t}</div>
            <div className="text-sm text-stone">{d}</div>
          </Link>
        ))}
      </div>

      <FrameTourOverlay open={showFrameTour} onClose={closeFrameTour} />
    </AppShell>
  );
}
