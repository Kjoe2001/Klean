import type { Metadata } from 'next';
import Link from 'next/link';
import MarketingNav from '@/components/MarketingNav';
import { FaqSection } from '@/components/FaqSection';
import { SocialProof } from '@/components/SocialProof';
import { CONTENT_TYPES } from '@/lib/content-types';
import { Icon } from '@/components/Icon';

export const metadata: Metadata = {
  title: 'The AI Marketing Operating System | One Brief In, A Month of Marketing Out',
  description:
    "Africa's AI marketing OS. Generate 16 content types, AI images, full campaign strategies, trend & competitor intel from one brief. Pay with Mobile Money or card. Free 7-day trial.",
  alternates: { canonical: 'https://www.zelvoo.app' },
  openGraph: {
    title: 'Zelvoo — One brief in. A month of marketing out.',
    description: 'Your entire marketing team, running on AI. 16 content types, AI images, campaigns & client-ready decks.',
    url: 'https://www.zelvoo.app', siteName: 'Zelvoo', type: 'website',
  },
};

export default function Landing() {
  return (
    <div className="bg-white">
      <MarketingNav />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 pt-24 pb-16 md:pt-32">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/8 border border-primary/20 text-xs font-semibold text-primary mb-6">
            <Icon name="auto_awesome" className="text-[14px] msym-sm" />
            AI marketing, built for Africa
          </span>
          <h1 className="font-heading font-semibold text-[#0A0E27] text-hero leading-[1.05] tracking-tight mb-6">
            One brief in.<br />
            <span className="grad-text">A month of marketing out.</span>
          </h1>
          <p className="text-body-lg text-[#6B7280] max-w-2xl mb-10 leading-relaxed">
            Your entire marketing team, running on AI. 16 content types, AI images, full campaign
            strategies, trend intelligence and client-ready decks — from a single brief.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/signup" className="btn-primary text-base px-8 py-4">
              Start your 7-day free trial
              <Icon name="arrow_forward" className="msym-sm" />
            </Link>
            <Link href="/pricing" className="btn-outline text-base px-7 py-4">
              See pricing
            </Link>
          </div>
          <p className="text-xs text-[#9CA3AF] mt-4">Free 7-day trial · 30 credits · No card required</p>
        </div>

        {/* Product screenshot frame */}
        <div className="mt-16 relative">
          <div className="absolute inset-x-1/4 -top-10 h-40 bg-primary/10 blur-3xl rounded-full pointer-events-none" />
          <div className="relative rounded-[20px] border border-[#E5E7EB] overflow-hidden shadow-float">
            {/* Browser chrome */}
            <div className="bg-[#F7F7FB] border-b border-[#E5E7EB] px-4 py-3 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#E5E7EB]" />
              <span className="w-3 h-3 rounded-full bg-[#E5E7EB]" />
              <span className="w-3 h-3 rounded-full bg-[#E5E7EB]" />
              <div className="ml-3 flex-1 bg-white rounded-full px-4 py-1.5 text-xs text-[#9CA3AF] border border-[#E5E7EB]">app.zelvoo.com/content-studio</div>
            </div>
            <div className="bg-[#F7F7FB] h-[340px] md:h-[480px] flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-[20px] bg-ink mx-auto grid place-items-center">
                  <Icon name="auto_awesome" className="text-white msym-lg" />
                </div>
                <p className="font-heading font-semibold text-[#0A0E27]">Content Studio</p>
                <p className="text-sm text-[#6B7280]">Product screenshot coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social proof stats strip ──────────────────────────────── */}
      <SocialProof />

      {/* ── Content types grid ───────────────────────────────────── */}
      <section className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-14">
            <h2 className="font-heading font-semibold text-[#0A0E27] text-h2 mb-4">16 content formats. One brief.</h2>
            <p className="text-[#6B7280] text-body-lg max-w-xl mx-auto">
              Select any combination — Zelvoo generates them simultaneously, each scored for virality and engagement.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {CONTENT_TYPES.slice(0, 8).map(t => (
              <div key={t.id} className="card p-5 hover:border-primary/40 hover:shadow-float transition-all duration-150 group">
                <div className="w-10 h-10 rounded-[12px] bg-[#F7F7FB] border border-[#E5E7EB] grid place-items-center mb-4 group-hover:bg-primary/8 group-hover:border-primary/20 transition-colors">
                  <Icon name={t.msym} className="text-[#6B7280] group-hover:text-primary transition-colors" />
                </div>
                <p className="font-semibold text-[#0A0E27] text-sm">{t.label}</p>
                <p className="text-xs text-[#6B7280] mt-1">{t.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-[#9CA3AF] mt-5">
            + 8 more content types · AI Image Studio · Campaign Builder · Trend Discovery · Competitor Intel
          </p>
        </div>
      </section>

      {/* ── Value props ───────────────────────────────────────────── */}
      <section className="bg-[#F7F7FB] border-y border-[#E5E7EB] py-24">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              ['trending_up', 'One brief, everything', 'Lock a brand brief once. Every hook, article, ad and image follows your Brand Kit automatically.'],
              ['bolt',        'Parallel AI engine',    'Select any mix of content types — they generate simultaneously with virality and engagement scoring.'],
              ['picture_as_pdf', 'Client-ready exports', 'Branded PDF reports and PowerPoint decks with AI-generated visuals, built in seconds.'],
            ].map(([icon, title, desc]) => (
              <div key={title} className="card p-8">
                <div className="w-12 h-12 rounded-[14px] bg-ink grid place-items-center mb-6">
                  <Icon name={icon} className="text-white" />
                </div>
                <h3 className="font-heading font-semibold text-[#0A0E27] text-h3 mb-3">{title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <FaqSection />

      {/* ── Final CTA ─────────────────────────────────────────────── */}
      <section className="bg-ink py-24">
        <div className="max-w-3xl mx-auto px-5 text-center">
          <h2 className="font-heading font-semibold text-white text-h2 mb-5">
            Ready to build your first campaign?
          </h2>
          <p className="text-white/60 text-body mb-10">
            Start free. No credit card required. 30 credits included.
          </p>
          <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-white text-[#0A0E27] font-semibold font-heading px-8 py-4 text-base transition-all duration-150 hover:bg-primary hover:text-white active:scale-[0.98]">
            Start your free trial
            <Icon name="arrow_forward" className="msym-sm" />
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="bg-ink border-t border-white/10 py-10">
        <div className="max-w-6xl mx-auto px-5 flex flex-wrap items-center justify-between gap-4">
          <p className="text-white/40 text-sm">© 2026 Zelvoo</p>
          <div className="flex flex-wrap gap-5 text-sm text-white/50">
            {[['Privacy','/privacy'],['Terms','/terms'],['Refunds','/refund-policy'],['Cookies','/cookies'],['Contact','/contact']].map(([l,h]) => (
              <Link key={h} href={h} className="hover:text-white/80 transition-colors">{l}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

