import type { Metadata } from 'next';
import Link from 'next/link';
import MarketingNav from '@/components/MarketingNav';
import { FaqSection } from '@/components/FaqSection';
import { Icon } from '@/components/Icon';
import { SocialProof } from '@/components/SocialProof';
import { CONTENT_TYPES } from '@/lib/content-types';

export const metadata: Metadata = {
  title: 'The AI Marketing Operating System | One Brief In, A Month of Marketing Out',
  description:
    "Africa's AI marketing OS. Generate 16 content types, AI images, full campaign strategies, trend & competitor intel from one brief. Pay with Mobile Money or card. Free 7-day trial.",
  alternates: { canonical: 'https://www.zelvoo.app' },
  openGraph: {
    title: 'Zelvoo — One brief in. A month of marketing out.',
    description: 'Your entire marketing team, running on AI. 16 content types, AI images, campaigns & client-ready decks.',
    url: 'https://www.zelvoo.app',
    siteName: 'Zelvoo',
    type: 'website',
  },
};

export default function Landing() {
  return (
    <>
      <MarketingNav />
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-20 w-[360px] h-[360px] rounded-full bg-secondary/15 blur-2xl" />
        <div className="absolute -bottom-36 -left-24 w-[380px] h-[380px] rounded-full bg-primary/15 blur-2xl" />
      </div>
      <header className="max-w-7xl mx-auto px-5 pt-16 pb-10 animate-rise">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] items-center">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.26em] text-white/80">
              <Icon name="auto_awesome" className="text-secondary" />
              Built for high-growth African brands
            </div>
            <div className="space-y-5">
              <h1 className="font-sora font-extrabold text-4xl md:text-6xl leading-tight text-white">
                A modern marketing OS that turns one brand brief into revenue-driving campaigns.
              </h1>
              <p className="max-w-2xl text-slate-300 text-base md:text-lg leading-8">
                From launch campaigns and social posts to AI image creation and growth intelligence — Zelvoo gives founders and teams a premium, executive-ready stack that moves faster than traditional agencies.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-8 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5">
                <Icon name="trending_up" className="text-[18px]" /> Start 7-day trial
              </Link>
              <Link href="/pricing" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-7 py-4 text-sm font-semibold text-white/90 transition hover:border-white/20 hover:bg-white/10">
                View pricing
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                ['16', 'Content formats'],
                ['AI', 'Images & campaigns'],
                ['30', 'Credits free trial'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-3xl bg-white/5 border border-white/10 p-4">
                  <div className="text-3xl font-sora font-extrabold text-white">{value}</div>
                  <div className="mt-1 text-sm text-slate-400">{label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 shadow-2xl shadow-slate-950/30">
            <div className="text-slate-400 text-xs uppercase tracking-[0.22em] mb-5">Revenue-ready marketing suite</div>
            <div className="grid gap-4">
              {[
                ['Savings', 'Spend 80% less than agency retainers on launches and campaigns.'],
                ['Speed', 'Build campaign-ready assets in minutes, not weeks.'],
                ['Consistency', 'One brand brief powers every post, email and image.'],
              ].map(([title, detail]) => (
                <div key={title} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="font-sora font-semibold text-white">{title}</div>
                  <p className="text-sm text-slate-400 mt-2">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>
      <section className="max-w-6xl mx-auto px-5 pb-16">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {CONTENT_TYPES.slice(0, 8).map(t => (
            <div key={t.id} className="glass rounded-[1.75rem] p-6 transition hover:-translate-y-1 hover:shadow-glow">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-white/5 text-primary">
                <Icon name={t.msym} className="text-[24px]" />
              </div>
              <div className="mt-5 font-sora font-semibold text-sm text-white">{t.label}</div>
              <p className="mt-2 text-sm text-slate-400">{t.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center text-xs text-slate-500 mt-4">+ 8 more content types · AI Image Studio · Campaign Builder · Trend Discovery · Competitor Intel</div>
      </section>
      <section className="max-w-6xl mx-auto px-5 pb-6">
        <SocialProof />
      </section>
      <section className="max-w-6xl mx-auto px-5 pb-20 grid gap-4 md:grid-cols-3">
        {[
          ['trending_up', 'Built for growth', 'Scale campaigns with clear KPIs, assets and messaging designed to convert.'],
          ['shield', 'Reliable execution', 'Maintain brand tone across every channel with a single source of truth.'],
          ['payments', 'Premium positioning', 'Present your brand like a high-ticket agency without the overhead.'],
        ].map(([icon, title, text]) => (
          <div key={title as string} className="glass rounded-[2rem] p-8 border border-white/10">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-brand-gradient text-white">
              <Icon name={icon as string} className="text-[22px]" />
            </div>
            <h3 className="font-sora font-bold text-xl text-white mt-5">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">{text}</p>
          </div>
        ))}
      </section>
      <FaqSection />
      <footer className="text-center text-xs text-slate-400 pb-10 space-x-4">
        <span>© 2026 Zelvoo</span>
        <Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link>
        <Link href="/refund-policy">Refunds</Link><Link href="/cookies">Cookies</Link><Link href="/contact">Contact</Link>
      </footer>
    </>
  );
}
