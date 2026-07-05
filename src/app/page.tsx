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
      <header className="max-w-4xl mx-auto px-5 pt-16 pb-10 animate-rise">
        <div className="feature-card text-center px-6 py-12 md:px-12 md:py-16">
          <div className="inline-flex items-center gap-1.5 bg-white/[0.06] px-3 py-1.5 rounded-full mb-5">
            <Icon name="auto_awesome" className="text-secondary" />
            <span className="text-[11px] feature-muted">AI marketing, built for Africa</span>
          </div>
          <h1 className="font-sora font-extrabold text-3xl md:text-5xl leading-[1.12] text-white">
            One brief in.<br /><span className="grad-text">A month of marketing out.</span>
          </h1>
          <p className="feature-muted max-w-xl mx-auto mt-5 text-[15px]">
            Your entire marketing team, running on AI. 16 content types with generated images, full campaign
            strategies, trends, competitor intel and client-ready decks — from one brief.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            <Link href="/signup" className="bg-brand-gradient text-white font-sora font-bold rounded-full px-9 py-4 text-base transition hover:-translate-y-0.5">
              <Icon name="bolt" className="mr-1 align-middle" />Start your 7-day free trial
            </Link>
            <Link href="/pricing" className="bg-white/[0.08] text-white rounded-full !px-6 !py-3.5 !text-sm font-sora font-bold hover:bg-white/[0.12] transition">See pricing</Link>
          </div>
          <div className="text-xs feature-dim mt-4">Free 7-day trial · 30 credits · No card required</div>
        </div>
      </header>
      <section className="max-w-5xl mx-auto px-5 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CONTENT_TYPES.slice(0, 8).map(t => (
            <div key={t.id} className="glass !rounded-2xl p-4 hover:-translate-y-1 transition">
              <div className="text-xl">{t.icon}</div>
              <div className="font-sora font-bold text-[13px] mt-1.5">{t.label}</div>
              <div className="text-[11.5px] text-slate-500">{t.desc}</div>
            </div>
          ))}
        </div>
        <div className="text-center text-xs text-slate-400 mt-3">+ 8 more content types · AI Image Studio · Campaign Builder · Trend Discovery · Competitor Intel</div>
      </section>
      <section className="max-w-5xl mx-auto px-5 pb-6">
        <SocialProof />
      </section>
      <section className="max-w-5xl mx-auto px-5 pb-20 grid md:grid-cols-3 gap-4">
        {[
          ['🪄','One brief, everything','Lock a brand brief once. Every hook, article, ad and image follows your Brand Kit automatically.'],
          ['⚡','Parallel AI engine','Select any mix of content types — they generate simultaneously with virality and engagement scoring.'],
          ['📦','Client-ready exports','Branded PDF reports and PowerPoint decks with AI-generated visuals, built in seconds.'],
        ].map(([i,t,d]) => (
          <div key={t as string} className="glass p-6">
            <div className="text-2xl">{i}</div>
            <h3 className="font-sora font-bold mt-2">{t}</h3>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{d}</p>
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
