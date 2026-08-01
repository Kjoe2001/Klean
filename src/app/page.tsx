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
    "Africa's AI marketing OS. Generate content, campaign strategies, trend and competitor intel from one brief. Built for brands, agencies, and creators.",
  alternates: { canonical: 'https://www.zelvoo.app' },
  openGraph: {
    title: 'Zelvoo — One brief in. A month of marketing out.',
    description: 'Your AI marketing operating system for African growth teams. Generate content and campaign strategy from one brief.',
    url: 'https://www.zelvoo.app', siteName: 'Zelvoo', type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zelvoo — One brief in. A month of marketing out.',
    description: 'Your AI marketing operating system for African growth teams.',
  },
};

const homepageJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: 'Zelvoo',
      url: 'https://www.zelvoo.app',
      logo: 'https://www.zelvoo.app/favicon.ico',
      sameAs: [],
    },
    {
      '@type': 'WebSite',
      name: 'Zelvoo',
      url: 'https://www.zelvoo.app',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://www.zelvoo.app/templates',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Zelvoo',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      url: 'https://www.zelvoo.app',
      description: 'AI marketing operating system for content generation, campaign planning, and market intelligence.',
    },
  ],
};

export default function Landing() {
  return (
    <div className="section-light min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageJsonLd) }} />
      <div className="orb-fixed-light animate-orb" />
      <MarketingNav />

      <section className="section-dark border-b border-mountain-meadow/15">
        <div className="max-w-6xl mx-auto px-5 pt-14 pb-16 md:pt-20 md:pb-20">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-12 items-start">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-bangladesh-green/25 border border-mountain-meadow/25 text-xs font-medium text-caribbean-green mb-6">
              <Icon name="auto_awesome" className="text-[14px] msym-sm" />
              AI marketing, built for Africa
            </span>
            <h1 className="font-heading text-[3rem] md:text-[4.4rem] leading-[0.98] tracking-tight mb-6 max-w-3xl" style={{ color: '#00DF81' }}>
              A month&apos;s worth of marketing in minutes.
            </h1>
            <p className="text-body-lg md:text-[1.18rem] text-pistachio max-w-2xl leading-relaxed mb-8">
              Zelvoo turns one brief into ready-to-publish campaigns across social posts, ad copy,
              pitches, and strategies in one place, built for Africa.
            </p>

            <div className="flex flex-wrap max-[480px]:grid max-[480px]:grid-cols-1 items-center gap-3 max-[480px]:w-full">
              <Link href="/signup" className="btn-primary text-base px-8 py-4 max-[480px]:w-full">
                Start free
                <Icon name="arrow_forward" className="msym-sm" />
              </Link>
              <Link href="/pricing" className="btn-outline text-base px-7 py-4 max-[480px]:w-full">
                See pricing
              </Link>
            </div>
            <p className="text-xs text-stone mt-4">Free signup · 30 credits · No card required</p>

          </div>

          <div className="grid gap-4">
            <div className="glass-card-light glass-highlight p-5 md:p-6 border border-mountain-meadow/15">
              <p className="text-[10px] font-semibold tracking-[0.24em] text-bangladesh-green mb-3">WHAT YOU GET</p>
              <div className="space-y-3">
                {[
                  'Social posts, captions, and hooks',
                  'Ad copy and campaign strategies',
                  'Pitches, reports, and client-ready PDFs',
                  'Trend and competitor intelligence',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-xl bg-white px-3 py-3 border border-bangladesh-green/10">
                    <span className="mt-1 w-2.5 h-2.5 rounded-full bg-caribbean-green shrink-0" />
                    <span className="text-sm text-rich-black leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-5 md:p-6 border border-caribbean-green/15">
              <p className="text-[10px] font-semibold tracking-[0.24em] text-pistachio/80 mb-3">BUILT FOR TEAM SPEED</p>
              <div className="grid grid-cols-2 gap-3 text-sm text-anti-flash-white">
                <div className="rounded-xl bg-bangladesh-green/20 px-3 py-3">Fast first drafts</div>
                <div className="rounded-xl bg-bangladesh-green/20 px-3 py-3">Cleaner approvals</div>
                <div className="rounded-xl bg-bangladesh-green/20 px-3 py-3">Client-ready output</div>
                <div className="rounded-xl bg-bangladesh-green/20 px-3 py-3">Africa-first tone</div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      <SocialProof />

      <section className="section-dark border-y border-mountain-meadow/15 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-14">
            <p className="eyebrow mb-4">Output Engine</p>
            <h2 className="font-heading text-h2 mb-4 text-anti-flash-white">16 content formats. One brief.</h2>
            <p className="text-pistachio text-body-lg max-w-xl mx-auto">
              Select any combination. Zelvoo generates them simultaneously, each scored for virality and engagement.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {CONTENT_TYPES.slice(0, 8).map(t => (
              <div key={t.id} className="glass-card glass-highlight p-5 hover:border-caribbean-green/45 transition-all duration-150 group">
                <div className="w-10 h-10 rounded-[12px] bg-bangladesh-green/20 border border-mountain-meadow/20 grid place-items-center mb-4 group-hover:bg-bangladesh-green/35 transition-colors">
                  <Icon name={t.msym} className="text-pistachio group-hover:text-caribbean-green transition-colors" />
                </div>
                <p className="font-medium text-anti-flash-white text-sm">{t.label}</p>
                <p className="text-xs text-pistachio mt-1">{t.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-stone mt-6">
            + 8 more content types · Campaign Builder · Trend Discovery · Competitor Intel
          </p>
        </div>
      </section>

      <section className="section-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              ['trending_up', 'One brief, everything', 'Lock a brand brief once. Every hook, article and ad follows your Brand Kit automatically.'],
              ['bolt', 'Parallel AI engine', 'Select any mix of content types. They generate simultaneously with virality and engagement scoring.'],
              ['picture_as_pdf', 'Client-ready exports', 'Branded PDF reports and PowerPoint decks, built in seconds.'],
            ].map(([icon, title, desc]) => (
              <div key={title} className="glass-card-light glass-highlight p-8">
                <div className="w-12 h-12 rounded-[14px] bg-caribbean-green text-rich-black grid place-items-center mb-6 shadow-[0_0_28px_rgba(0,223,129,0.2)]">
                  <Icon name={icon} />
                </div>
                <h3 className="font-heading font-medium text-rich-black text-h3 mb-3">{title}</h3>
                <p className="text-sm text-stone leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FaqSection />

      <section className="section-white py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-5 text-center">
          <p className="eyebrow mb-4">Start In Minutes</p>
          <h2 className="font-heading text-h2 mb-5 text-rich-black">
            Ready to build your first campaign?
          </h2>
          <p className="text-stone text-body mb-10 max-w-xl mx-auto">
            Start free. No credit card required. 30 credits included.
          </p>
          <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-caribbean-green text-rich-black font-medium font-heading px-8 py-4 text-base transition-all duration-150 hover:brightness-110 hover:shadow-[0_0_40px_rgba(0,223,129,0.35)] active:scale-[0.98]">
            Start your free trial
            <Icon name="arrow_forward" className="msym-sm" />
          </Link>
        </div>
      </section>

    </div>
  );
}

