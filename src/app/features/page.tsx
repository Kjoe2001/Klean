import type { Metadata } from 'next';
import Link from 'next/link';
import MarketingNav from '@/components/MarketingNav';
import { Icon } from '@/components/Icon';

export const metadata: Metadata = {
  title: 'Features - Zelvoo Products, AI Engines, and Content Studio | Zelvoo',
  description:
    'Zelvoo now combines five focused products with one shared campaign workflow: Video Frame Studio, News Frame Studio, Campaign Builder, Content Studio, and Creative Studio.',
  alternates: { canonical: 'https://www.zelvoo.app/features' },
};

const PRODUCTS = [
  { msym: 'movie', name: 'Video Frame Studio', desc: 'Build short-form video frames, hooks, and scene-ready concepts fast.', href: '/frame-studio?standalone=1&desktopProduct=frame' },
  { msym: 'feed', name: 'News Frame Studio', desc: 'Turn trends and news moments into quick-response marketing content.', href: '/news-frame?standalone=1&desktopProduct=news' },
  { msym: 'campaign', name: 'Campaign Builder', desc: 'Create multi-week plans with channels, tasks, and asset output in sync.', href: '/campaign-builder?standalone=1&desktopProduct=campaign' },
  { msym: 'edit_square', name: 'Content Studio', desc: 'Generate social copy, ads, email sequences, and blog drafts from one brief.', href: '/content-studio?standalone=1&desktopProduct=content' },
  { msym: 'palette', name: 'Creative Studio', desc: 'Shape visual direction and campaign-ready creative assets quickly.', href: '/creative-studio?standalone=1&desktopProduct=creative' },
];

const WHATS_NEW = [
  ['widgets', 'Product-first workflow', 'Switch between five focused studios without losing context or campaign direction.'],
  ['calendar_month', 'Campaign system refresh', 'Plan objective, channels, weekly calendar, and asset generation from one structured view.'],
  ['picture_as_pdf', 'Faster handoff', 'Export to PDF or PPT and deliver clean client-ready outputs in minutes.'],
  ['devices', 'Desktop + web parity', 'Use the same studios in browser or standalone desktop product flows.'],
];

const CONTENT_TYPES = [
  { msym: 'local_fire_department', label: 'Hooks', desc: '10 scroll-stopping openers ranked by strength for Reels, TikTok, X, and ads.' },
  { msym: 'dynamic_feed', label: 'Social Posts', desc: '7 platform-native post concepts tailored to each feed context.' },
  { msym: 'chat_bubble', label: 'Captions', desc: '3 caption variants with researched hashtags ready to publish.' },
  { msym: 'view_carousel', label: 'Carousels', desc: '5-slide narrative arcs built for campaign storytelling.' },
  { msym: 'movie', label: 'Reel Scripts', desc: 'Timed scenes with voiceover lines and visual direction.' },
  { msym: 'videocam', label: 'Video Scripts', desc: '60-90 second scripts for YouTube and paid video placements.' },
  { msym: 'article', label: 'Blog Articles', desc: 'SEO-driven outlines and draft sections mapped to your core keyword.' },
  { msym: 'mail', label: 'Email Campaigns', desc: '3-email campaign sequences: hook, value, and close.' },
  { msym: 'work', label: 'LinkedIn Articles', desc: 'Thought-leadership content designed to trigger meaningful replies.' },
  { msym: 'shopping_bag', label: 'Product Descriptions', desc: 'Benefit-led commerce copy with clear product details.' },
  { msym: 'newspaper', label: 'Press Releases', desc: 'Structured release format with headline, quotes, and boilerplate.' },
  { msym: 'ads_click', label: 'Ad Copy', desc: 'Meta and Google copy variants with correct character lengths.' },
  { msym: 'web', label: 'Landing Page Copy', desc: 'Full conversion page flow from hero to proof to CTA.' },
  { msym: 'mic', label: 'Podcast Scripts', desc: 'Episode intros, segment prompts, and closing sequences.' },
  { msym: 'subscriptions', label: 'Newsletters', desc: 'Issue structure and copy that keeps subscribers engaged.' },
  { msym: 'search', label: 'SEO Content', desc: 'Keyword clusters, metadata, and heading structures for discovery.' },
];

const ENGINES = [
  { msym: 'campaign', title: 'Campaign Builder', desc: 'Turn one objective into a clear plan with channels, timing, and assets generated together.' },
  { msym: 'trending_up', title: 'Trend Discovery', desc: 'Track current market attention so your team can publish timely, high-relevance content.' },
  { msym: 'visibility', title: 'Competitor Intel', desc: 'Break down what competing brands are publishing and identify practical response opportunities.' },
];

export default function FeaturesPage() {
  return (
    <div className="section-light min-h-screen">
      <div className="orb-fixed-light animate-orb" />
      <MarketingNav />

      <main className="mx-auto max-w-6xl px-5 py-14 md:py-20 animate-rise relative z-10">
        <section className="mb-16">
          <div className="rounded-[28px] border border-bangladesh-green/15 bg-gradient-to-br from-white to-[#eaf4ef] px-6 py-8 md:px-10 md:py-12 shadow-[0_35px_85px_rgba(0,0,0,0.12)]">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] items-start">
              <div>
                <p className="eyebrow mb-4">Platform Features</p>
                <h1 className="font-heading text-[2.2rem] sm:text-[2.9rem] md:text-[3.8rem] leading-[0.96] text-rich-black">
                  Better products.<br className="hidden sm:block" />Cleaner workflow.<br className="hidden sm:block" />Faster marketing output.
                </h1>
                <p className="mt-5 max-w-2xl text-base sm:text-body-lg text-stone leading-relaxed">
                  Zelvoo now combines five focused products with one shared campaign workflow so your team can move from strategy to assets with less friction.
                </p>
                <div className="mt-7 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
                  <Link href="/signup" className="btn-primary px-7 py-3.5 text-sm w-full sm:w-auto justify-center">
                    <Icon name="bolt" className="mr-1 align-middle" /> Start your 7-day free trial
                  </Link>
                  <Link href="/downloads" className="btn-outline px-7 py-3.5 text-sm w-full sm:w-auto justify-center">
                    Download standalone products
                  </Link>
                </div>
                <p className="mt-3 text-sm text-stone">Free signup includes 50 credits · no card required</p>
              </div>

              <div className="relative mx-auto w-full max-w-[34rem] lg:max-w-none">
                <div className="absolute -inset-6 rounded-[2.5rem] bg-[radial-gradient(circle_at_45%_42%,rgba(0,223,129,0.22),rgba(0,62,49,0.42)_44%,rgba(0,17,13,0)_74%)] blur-[34px]" />
                <div className="relative rounded-[1.8rem] border border-[#cfd8d5] bg-gradient-to-b from-[#fbfdfc] to-[#d9e3df] p-3 shadow-[0_28px_70px_rgba(0,0,0,0.24)]">
                  <div className="rounded-[1.25rem] border border-[#1f2f2b] bg-white overflow-hidden">
                    <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[108px_1fr]">
                      <aside className="bg-[#eaf7f2] text-rich-black/80 p-2.5 sm:p-3 text-[9px] sm:text-[10px]">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-5 h-5 rounded-md bg-caribbean-green text-rich-black grid place-items-center text-[10px] font-bold">z</div>
                          <span className="font-semibold text-bangladesh-green">zelvoo</span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="px-2 py-1 rounded">Home</div>
                          <div className="px-2 py-1 rounded">Content</div>
                          <div className="px-2 py-1 rounded bg-caribbean-green/25 text-bangladesh-green font-semibold">Campaign</div>
                          <div className="px-2 py-1 rounded">Frames</div>
                        </div>
                      </aside>
                      <div className="bg-[#f8fbf9] p-3 sm:p-4">
                        <div className="rounded-lg bg-white border border-black/5 px-3 py-2 mb-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="text-[12px] sm:text-[13px] font-semibold text-rich-black">Campaign Builder</p>
                              <p className="text-[9px] sm:text-[10px] text-stone">Objective - launch plan</p>
                            </div>
                            <span className="hidden sm:inline-flex rounded-full bg-caribbean-green/20 text-caribbean-green px-2.5 py-1 text-[9px] font-semibold">Generate</span>
                          </div>
                        </div>
                        <div className="rounded-lg border border-bangladesh-green/15 bg-white px-3 py-2.5 mb-2.5">
                          <p className="text-[8px] font-semibold tracking-[0.2em] text-stone">OBJECTIVE</p>
                          <p className="text-[11px] sm:text-[13px] font-semibold text-rich-black mt-1">Drive Ramadan footfall to stores</p>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 mb-2.5">
                          {[['4', 'WEEKS'], ['4', 'CHANNELS'], ['22', 'ASSETS'], ['88', 'SCORE']].map(([v, l]) => (
                            <div key={l} className="rounded-md border border-bangladesh-green/10 bg-[#f9fbfa] py-1.5 text-center">
                              <p className="text-[10px] sm:text-[11px] font-semibold text-bangladesh-green">{v}</p>
                              <p className="text-[7px] text-stone">{l}</p>
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[8px]">
                          {[['Week 1', 'Teaser reel'], ['Week 2', 'UGC review'], ['Week 3', 'Countdown'], ['Week 4', 'Eid post']].map(([w, t]) => (
                            <div key={w} className="rounded-md border border-bangladesh-green/10 bg-white p-1.5">
                              <p className="font-semibold text-rich-black mb-1">{w}</p>
                              <p className="rounded bg-caribbean-green/14 text-bangladesh-green px-1 py-0.5 truncate">{t}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mx-auto mt-3 h-[18px] w-[34%] rounded-b-[999px] bg-gradient-to-b from-[#dbe5e1] to-[#b9c4c0] border border-[#b4bfbc]" />
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
            <div>
              <p className="eyebrow mb-2">Products</p>
              <h2 className="text-h2 font-heading text-rich-black">All 5 Zelvoo products</h2>
              <p className="mt-2 text-stone text-body">Use every product in browser or launch standalone flows from desktop.</p>
            </div>
            <Link href="/downloads" className="btn-primary px-6 py-3 text-sm">
              Open downloads<Icon name="download" className="msym-sm" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            {PRODUCTS.map((p) => (
              <Link key={p.name} href={p.href} className="glass-card-light glass-highlight rounded-2xl border border-bangladesh-green/15 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-caribbean-green/45">
                <div className="w-10 h-10 rounded-xl bg-caribbean-green/20 border border-caribbean-green/30 grid place-items-center mb-4 text-bangladesh-green">
                  <Icon name={p.msym} className="msym-sm" />
                </div>
                <h3 className="font-heading text-[1.02rem] text-rich-black mb-2 leading-tight">{p.name}</h3>
                <p className="text-sm text-stone leading-relaxed">{p.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <div className="rounded-[24px] border border-caribbean-green/20 bg-gradient-to-br from-white to-[#ecfaf3] p-7 md:p-9">
            <div className="mb-7">
              <p className="eyebrow mb-3">What is new</p>
              <h2 className="text-h2 font-heading text-rich-black">Recent platform changes</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {WHATS_NEW.map(([msym, title, desc]) => (
                <div key={title} className="glass-card-light glass-highlight p-5">
                  <div className="w-11 h-11 rounded-[12px] bg-caribbean-green/20 border border-caribbean-green/30 grid place-items-center mb-4">
                    <Icon name={msym} className="text-caribbean-green" />
                  </div>
                  <h3 className="text-rich-black font-medium text-lg">{title}</h3>
                  <p className="text-stone mt-2 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-16 grid sm:grid-cols-3 gap-3">
          {[['16', 'Content types'], ['3', 'Core AI engines'], ['5', 'Standalone products']].map(([value, label]) => (
            <div key={label} className="glass-card-light glass-highlight p-5 text-center">
              <p className="text-stat font-heading text-caribbean-green">{value}</p>
              <p className="text-sm text-rich-black mt-1">{label}</p>
            </div>
          ))}
        </section>

        <section className="mb-20">
          <div className="mb-8">
            <h2 className="text-h2 font-heading text-rich-black">All 16 content types</h2>
            <p className="mt-2 text-stone text-body">Every generation follows your Brand Kit and keeps output aligned.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CONTENT_TYPES.map((t) => (
              <div key={t.label} className="glass-card-light glass-highlight p-5 hover:border-caribbean-green/45 transition-all duration-150">
                <Icon name={t.msym} className="text-2xl text-caribbean-green" />
                <h3 className="mt-3 font-medium text-rich-black">{t.label}</h3>
                <p className="mt-1 text-sm text-stone">{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-20 rounded-[24px] border border-caribbean-green/20 bg-gradient-to-br from-white to-[#ecfaf3] p-7 md:p-9">
          <h2 className="mb-8 text-h2 font-heading text-rich-black">Beyond content: three growth engines</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {ENGINES.map((e) => (
              <div key={e.title} className="glass-card-light glass-highlight p-6">
                <Icon name={e.msym} className="text-3xl text-caribbean-green" />
                <h3 className="mt-3 text-lg font-medium text-rich-black">{e.title}</h3>
                <p className="mt-2 text-stone">{e.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card-light glass-highlight p-8 md:p-10 text-center">
          <Icon name="rocket_launch" className="text-3xl text-caribbean-green mx-auto" />
          <h2 className="mt-3 text-h2 font-heading text-rich-black">One brief in. A month of marketing out.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-stone">Plan campaigns, generate deliverables, and move to execution from one workspace designed for consistent output.</p>
          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
            <Link href="/signup" className="btn-primary px-7 py-3.5 text-sm w-full sm:w-auto justify-center">Start free</Link>
            <Link href="/pricing" className="btn-outline px-7 py-3.5 text-sm w-full sm:w-auto justify-center">Compare plans</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
