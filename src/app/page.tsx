import type { Metadata } from 'next';
import Link from 'next/link';
import MarketingNav from '@/components/MarketingNav';
import { FaqSection } from '@/components/FaqSection';
import { SocialProof } from '@/components/SocialProof';
import { CONTENT_TYPES } from '@/lib/content-types';
import { Icon } from '@/components/Icon';

export const metadata: Metadata = {
  title: 'Zelvoo | AI Marketing Workspace for Teams',
  description:
    "Zelvoo is an AI marketing workspace for founders, marketing teams, and agencies. Plan campaigns, generate content, and export client-ready assets from one brief.",
  alternates: { canonical: 'https://www.zelvoo.app' },
  openGraph: {
    title: 'Zelvoo — Your AI Marketing Workspace',
    description: 'Plan campaigns, generate content, and produce client-ready outputs from one brief.',
    url: 'https://www.zelvoo.app', siteName: 'Zelvoo', type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zelvoo — Your AI Marketing Workspace',
    description: 'Plan campaigns, generate content, and deliver client-ready outputs from one brief.',
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
              AI marketing workspace, built for African teams
            </span>
            <h1 className="font-heading text-[2.25rem] sm:text-[3rem] md:text-[4.4rem] leading-[0.94] tracking-tight mb-6 max-w-3xl break-words" style={{ color: '#00DF81' }}>
              Understand your market. Create faster. Ship consistently.
            </h1>
            <p className="text-base sm:text-body-lg md:text-[1.18rem] text-pistachio max-w-2xl leading-relaxed mb-8">
              Zelvoo is an AI marketing workspace where you plan campaigns, generate content,
              and produce client-ready outputs from one brief.
            </p>
            <p className="text-sm text-stone max-w-2xl leading-relaxed mb-8">
              Built for founders, in-house marketing teams, and agencies that need quality output every week
              without juggling disconnected tools.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <Link href="/signup" className="btn-primary text-base px-8 py-4 w-full sm:w-auto justify-center">
                Start free
                <Icon name="arrow_forward" className="msym-sm" />
              </Link>
              <Link href="/features" className="btn-outline text-base px-7 py-4 w-full sm:w-auto justify-center">
                See how it works
              </Link>
            </div>
            <p className="text-xs text-stone mt-4">Free signup · 50 credits included · No card required</p>

          </div>

          <div className="relative mx-auto w-full max-w-[48rem] lg:max-w-none">
            <div className="absolute -inset-x-16 -inset-y-12 rounded-[4.5rem] bg-[radial-gradient(circle_at_34%_48%,rgba(0,223,129,0.24),rgba(0,73,59,0.56)_38%,rgba(0,17,13,0)_70%)] blur-[42px]" />
            <div className="absolute -inset-x-10 inset-y-0 rounded-[3.5rem] border border-caribbean-green/10" />
            <div className="relative pt-2 sm:pt-3 lg:pt-0">
              <div className="relative w-full max-w-[43rem] mx-auto lg:mx-0 rounded-[2rem] border border-[#cfd8d5] bg-gradient-to-b from-[#fbfdfc] to-[#d9e3df] p-3 sm:p-4 shadow-[0_42px_105px_rgba(0,0,0,0.42)]">
                <div className="rounded-[1.45rem] border border-[#1f2f2b] bg-white overflow-hidden">
                  <div className="grid grid-cols-[92px_1fr] sm:grid-cols-[124px_1fr]">
                    <aside className="bg-[#0f332d] text-pistachio/85 p-3 sm:p-4 text-[9px] sm:text-[10px] leading-relaxed">
                      <div className="flex items-center gap-2 mb-5">
                        <div className="w-5 h-5 rounded-md bg-caribbean-green text-rich-black grid place-items-center text-[10px] font-bold">z</div>
                        <span className="font-semibold text-pistachio">zelvoo</span>
                      </div>
                      <p className="text-[8px] uppercase tracking-[0.18em] text-pistachio/45 mb-2">Workspace</p>
                      <div className="space-y-1.5">
                        <div className="px-2.5 py-1.5 rounded">Home</div>
                        <div className="px-2.5 py-1.5 rounded">Content Studio</div>
                        <div className="px-2.5 py-1.5 rounded">Creative Studio</div>
                        <div className="px-2.5 py-1.5 rounded bg-caribbean-green/25 text-pistachio font-semibold">Campaign Builder</div>
                        <div className="px-2.5 py-1.5 rounded">Video Frame Studio</div>
                        <div className="px-2.5 py-1.5 rounded">News Frame Studio</div>
                      </div>
                      <p className="text-[8px] uppercase tracking-[0.18em] text-pistachio/45 mt-4 mb-2">Library</p>
                      <div className="space-y-1.5 opacity-90">
                        <div className="px-2.5 py-1.5 rounded">Templates</div>
                        <div className="px-2.5 py-1.5 rounded">Brand Kit</div>
                        <div className="px-2.5 py-1.5 rounded">Billing</div>
                      </div>
                    </aside>
                    <div className="bg-[#f8fbf9] p-3 sm:p-4">
                      <div className="rounded-lg bg-white border border-black/5 px-3 py-2.5 sm:px-3.5 sm:py-3 mb-3">
                        <div className="flex items-center gap-2 justify-between">
                          <div className="w-20 sm:w-28 h-2.5 rounded bg-[#f0f4f2]" />
                          <div className="hidden sm:flex items-center gap-1.5 text-[9px]">
                            <span className="rounded-full border border-bangladesh-green/20 px-2 py-1 text-bangladesh-green font-semibold">Brand Kit</span>
                            <span className="rounded-full bg-caribbean-green/20 text-bangladesh-green px-2 py-1 font-semibold">412</span>
                            <span className="rounded-full bg-caribbean-green text-rich-black px-2.5 py-1 font-semibold">Generate assets</span>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-lg bg-white border border-black/5 px-3 py-2.5 sm:px-3.5 sm:py-3 mb-3">
                        <p className="text-[12px] sm:text-[13px] font-semibold text-rich-black">Campaign Builder</p>
                        <p className="text-[9px] sm:text-[10px] text-stone">Objective - launch plan</p>
                      </div>
                      <div className="rounded-lg border border-bangladesh-green/15 bg-white px-3.5 py-3 mb-3">
                        <p className="text-[8px] sm:text-[9px] font-semibold tracking-[0.2em] text-stone">OBJECTIVE</p>
                        <p className="text-[11px] sm:text-[13px] font-semibold text-rich-black mt-1">Drive Ramadan footfall to stores</p>
                      </div>
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        {[['4', 'WEEKS'], ['4', 'CHANNELS'], ['22', 'DELIVERABLES'], ['88', 'PLAN SCORE']].map(([v, l]) => (
                          <div key={l} className="rounded-lg border border-bangladesh-green/10 bg-[#f9fbfa] py-1.5 text-center">
                            <p className="text-[11px] sm:text-[12px] font-semibold text-bangladesh-green">{v}</p>
                            <p className="text-[7px] sm:text-[8px] text-stone mt-0.5">{l}</p>
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-5 gap-2 text-[8px] sm:text-[9px]">
                        <div className="space-y-1.5">
                          {['Instagram', 'TikTok', 'Email', 'Blog'].map((ch) => (
                            <p key={ch} className="rounded-md bg-[#0f332d] text-pistachio px-1.5 py-1 text-center font-medium">{ch}</p>
                          ))}
                        </div>
                        {[
                          ['Week 1', ['Teaser reel', 'Trend alert', 'Announce', 'SEO blog']],
                          ['Week 2', ['Carousel', 'UGC review', 'Value drop']],
                          ['Week 3', ['Deals post', 'Countdown', 'Gift guide']],
                          ['Week 4', ['Eid post', 'Eid reel', 'Thank you']],
                        ].map(([week, items]) => (
                          <div key={week as string} className="rounded-lg border border-bangladesh-green/10 bg-white p-1.5">
                            <p className="font-semibold text-rich-black mb-1">{week as string}</p>
                            <div className="space-y-1">
                              {(items as string[]).map((it) => (
                                <p key={it} className="rounded bg-caribbean-green/14 text-bangladesh-green px-1.5 py-0.5 leading-tight font-medium truncate">{it}</p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mx-auto mt-4 h-5 w-[36%] rounded-b-[999px] bg-gradient-to-b from-[#dbe5e1] to-[#b9c4c0] border border-[#b4bfbc]" />
              <div className="mx-auto mt-2.5 h-3.5 w-[20%] rounded-full bg-gradient-to-r from-[#8ca6a0] to-[#bfd1cb] opacity-80" />
            </div>
            <div className="relative mt-5 sm:mt-6 lg:mt-0 lg:absolute lg:top-12 lg:-right-10 mx-auto lg:mx-0 w-full max-w-[16.8rem] rounded-[2.2rem] border border-pistachio/30 bg-gradient-to-b from-[#f7fbf9] to-[#d8e3df] p-[11px] shadow-[0_30px_78px_rgba(0,0,0,0.44)]">
              <div className="rounded-[1.8rem] border border-rich-black/15 bg-white overflow-hidden">
                <div className="h-7 px-3.5 flex items-center justify-between text-[8px] text-rich-black/70">
                  <span>9:41</span>
                  <div className="w-16 h-2.5 rounded-full bg-rich-black" />
                  <span>⋯</span>
                </div>
                <div className="px-3.5 pb-3.5 pt-1.5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-[11px] font-semibold text-rich-black">Campaign Builder</p>
                      <p className="text-[9px] text-stone">Objective - launch plan</p>
                    </div>
                    <span className="rounded-full bg-caribbean-green/25 px-1.5 py-0.5 text-[8px] text-bangladesh-green font-semibold">412</span>
                  </div>
                  <div className="rounded-lg border border-bangladesh-green/15 p-[11px] mb-3">
                    <p className="text-[8px] font-semibold text-stone">OBJECTIVE</p>
                    <p className="text-[11px] font-semibold text-rich-black mt-1 leading-tight">Drive Ramadan footfall to stores</p>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 mb-3">
                    {[['4', 'W'], ['4', 'C'], ['22', 'A'], ['88', 'S']].map(([v, l]) => (
                      <div key={l} className="rounded-md border border-bangladesh-green/12 bg-[#f9fbfa] py-1 text-center">
                        <p className="text-[10px] font-semibold text-bangladesh-green">{v}</p>
                        <p className="text-[7px] text-stone">{l}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    {[
                      ['Week 1', ['Teaser', 'Announce', 'SEO']],
                      ['Week 2', ['Carousel', 'UGC', 'Value']],
                      ['Week 3', ['Countdown', 'Deals', 'Gift']],
                      ['Week 4', ['Eid reel', 'Eid post', 'Thanks']],
                    ].map(([week, tags]) => (
                      <div key={week as string} className="rounded-lg border border-bangladesh-green/12 bg-[#fcfefd] p-2">
                        <div className="flex items-center justify-between text-[9px] mb-1">
                          <span className="font-semibold text-rich-black">{week as string}</span>
                          <span className="text-stone">3 assets</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {(tags as string[]).map((t) => (
                            <span key={t} className="rounded bg-caribbean-green/14 text-bangladesh-green px-1 py-0.5 text-[8px] font-medium">{t}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3.5 rounded-xl bg-gradient-to-r from-caribbean-green to-mountain-meadow text-rich-black text-[11px] font-semibold text-center py-[11px] shadow-[0_10px_20px_rgba(0,223,129,0.35)]">Generate assets</div>
                </div>
                <div className="border-t border-bangladesh-green/10 px-3.5 py-2.5 grid grid-cols-5 text-center text-[7px] text-stone">
                  <span>Home</span>
                  <span>Content</span>
                  <span className="text-bangladesh-green font-semibold">+</span>
                  <span>Studio</span>
                  <span>Account</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      <SocialProof />

      <section className="section-white py-16 md:py-20 border-y border-bangladesh-green/12">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex flex-wrap items-end justify-between gap-5 mb-10">
            <div>
              <p className="eyebrow mb-3">Products</p>
              <h2 className="font-heading text-h2 text-rich-black">All 5 Zelvoo Products</h2>
              <p className="text-stone text-body mt-3 max-w-2xl">Use each studio in the browser, or install Zelvoo Desktop to launch all standalone product experiences from one app.</p>
            </div>
            <Link href="/downloads" className="btn-primary px-6 py-3">
              Download Standalone<Icon name="download" className="msym-sm" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            {[
              { msym: 'movie', name: 'Video Frame Studio', desc: 'Create short-form video frame scripts, hooks, and scene-ready concepts in minutes.', href: '/frame-studio?standalone=1&desktopProduct=frame' },
              { msym: 'feed', name: 'News Frame Studio', desc: 'Turn trends and headlines into fast response content your audience can act on.', href: '/news-frame?standalone=1&desktopProduct=news' },
              { msym: 'campaign', name: 'Campaign Builder', desc: 'Plan full campaigns with goals, channels, timeline, and execution checkpoints.', href: '/campaign-builder?standalone=1&desktopProduct=campaign' },
              { msym: 'edit_square', name: 'Content Studio', desc: 'Generate social posts, ad copy, blog angles, and messaging tailored to your brand voice.', href: '/content-studio?standalone=1&desktopProduct=content' },
              { msym: 'palette', name: 'Creative Studio', desc: 'Build visual directions and creative assets ready for client or team approval.', href: '/creative-studio?standalone=1&desktopProduct=creative' },
            ].map((p) => (
              <Link key={p.name} href={p.href} className="glass-card-light glass-highlight rounded-2xl border border-bangladesh-green/15 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-caribbean-green/45">
                <div className="w-10 h-10 rounded-xl bg-caribbean-green/20 border border-caribbean-green/30 grid place-items-center mb-4 text-bangladesh-green">
                  <Icon name={p.msym} className="msym-sm" />
                </div>
                <h3 className="font-heading text-[1.05rem] text-rich-black mb-2">{p.name}</h3>
                <p className="text-sm text-stone leading-relaxed">{p.desc}</p>
              </Link>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-bangladesh-green/15 bg-anti-flash-white px-5 py-4 text-sm text-stone">
            Want installers? Go to the <Link href="/downloads" className="font-semibold text-bangladesh-green hover:text-rich-black">Downloads page</Link> for Zelvoo Desktop (All Studios).
          </div>
        </div>
      </section>

      <section className="section-dark border-y border-mountain-meadow/15 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-14">
            <p className="eyebrow mb-4 text-caribbean-green">How Zelvoo Works</p>
            <h2 className="font-heading text-h2 mb-4 text-caribbean-green" style={{ color: '#00DF81' }}>Plan. Generate. Deliver.</h2>
            <p className="text-caribbean-green text-body-lg max-w-xl mx-auto">
              Start with one brief. Zelvoo turns it into strategy, content, creative, and exports your team can ship.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CONTENT_TYPES.slice(0, 8).map(t => (
              <div key={t.id} className="glass-card glass-highlight p-5 hover:border-caribbean-green/45 transition-all duration-150 group">
                <div className="w-10 h-10 rounded-[12px] bg-bangladesh-green/20 border border-mountain-meadow/20 grid place-items-center mb-4 group-hover:bg-bangladesh-green/35 transition-colors">
                  <Icon name={t.msym} className="text-caribbean-green transition-colors" />
                </div>
                <p className="font-medium text-caribbean-green text-sm">{t.label}</p>
                <p className="text-xs text-caribbean-green mt-1">{t.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-caribbean-green mt-6">
            + 8 more content types · Video Frame Studio · Campaign Builder · Trend Discovery · Competitor Intel
          </p>
        </div>
      </section>

      <section className="section-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              ['trending_up', 'Know what to do next', 'Get campaign direction and market context before your team starts writing or designing.'],
              ['bolt', 'Create in one workspace', 'Generate content, shape visuals, and keep everything aligned to your Brand Kit.'],
              ['picture_as_pdf', 'Deliver faster', 'Export reports and deliverables your client or internal team can approve immediately.'],
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
            New here? Start with one campaign brief.
          </h2>
          <p className="text-stone text-body mb-10 max-w-xl mx-auto">
            Give Zelvoo your objective, audience, and offer. We will generate the strategy, content, and assets from there.
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

