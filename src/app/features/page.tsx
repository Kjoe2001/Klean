import type { Metadata } from 'next';
import Link from 'next/link';
import { Icon } from '@/components/Icon';
import MarketingNav from '@/components/MarketingNav';
import AppImage from '@/components/AppImage';
import { MARKETING_IMAGES } from '@/lib/marketing-images';

export const metadata: Metadata = {
  title: 'Features — 16 AI Content Types & Campaign Builder | Zelvoo',
  description:
    'Everything Zelvoo generates from one brief: hooks, social posts, carousels, reel & video scripts, blogs, emails, ad copy, press releases, podcasts, newsletters, SEO content and more.',
  alternates: { canonical: 'https://www.zelvoo.app/features' },
};

const CONTENT_TYPES = [
  { msym: 'local_fire_department', label: 'Hooks', desc: '10 scroll-stopping openers ranked by strength — for Reels, TikTok, X and ads.' },
  { msym: 'dynamic_feed', label: 'Social Posts', desc: '7 platform-native post concepts, each shaped for the feed it lives on.' },
  { msym: 'chat_bubble', label: 'Captions', desc: '3 caption variants with researched hashtags, ready to paste.' },
  { msym: 'view_carousel', label: 'Carousels', desc: '5-slide narrative arc ready for your campaign story.' },
  { msym: 'movie', label: 'Reel Scripts', desc: 'Timed beats with voiceover lines and visual direction, second by second.' },
  { msym: 'videocam', label: 'Video Scripts', desc: '60–90 second scripts structured for YouTube and paid video ads.' },
  { msym: 'article', label: 'Blog Articles', desc: 'SEO-structured outline, intro and section drafts built around your keyword.' },
  { msym: 'mail', label: 'Email Campaigns', desc: '3-email sequence: hook, value, close — with subject line options.' },
  { msym: 'work', label: 'LinkedIn Articles', desc: 'Thought-leadership posts in your voice, built to start conversations.' },
  { msym: 'shopping_bag', label: 'Product Descriptions', desc: 'E-commerce-ready copy: benefits first, specs second, always on-brand.' },
  { msym: 'newspaper', label: 'Press Releases', desc: 'Newsroom format with headline, dateline, quotes and boilerplate.' },
  { msym: 'ads_click', label: 'Ad Copy', desc: 'Meta and Google variants — primary text, headlines and descriptions at correct lengths.' },
  { msym: 'web', label: 'Landing Page Copy', desc: 'Full page flow from hero to CTA: headlines, sections, social proof, closers.' },
  { msym: 'mic', label: 'Podcast Scripts', desc: 'Intro, segment structure and outro with natural talking points.' },
  { msym: 'subscriptions', label: 'Newsletters', desc: 'Complete issue structure and copy your subscribers actually read.' },
  { msym: 'search', label: 'SEO Content', desc: 'Keyword clusters, meta titles and descriptions, heading structures.' },
];

const ENGINES = [
  {
    msym: 'campaign',
    title: 'Campaign Builder',
    desc: 'Turn one objective into a full multi-week campaign: channel plan, content calendar and assets — generated together, in sync.',
  },
  {
    msym: 'trending_up',
    title: 'Trend Discovery',
    desc: 'Live trend intelligence for your market and niche, so your content rides what people are already talking about.',
  },
  {
    msym: 'visibility',
    title: 'Competitor Intel',
    desc: 'See what competing brands publish, what performs, and where the gaps are — then generate content that fills them.',
  },
];

export default function FeaturesPage() {
  return (
    <div className="section-light min-h-screen">
      <div className="orb-fixed-light animate-orb" />
      <MarketingNav />

      <main className="mx-auto max-w-6xl px-5 py-16 md:py-20 animate-rise relative z-10">
        <section className="mb-14 text-center max-w-4xl mx-auto">
          <p className="eyebrow mb-4">Platform Features</p>
          <h1 className="font-heading text-[2.2rem] sm:text-[2.8rem] md:text-[3.6rem] leading-[1.02] text-rich-black">
            Everything your marketing team creates.
            <br className="hidden md:block" /> Generated from one brief.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base sm:text-body-lg text-stone">
            Lock your Brand Kit once. Select any mix of content types and engines.
            Zelvoo generates in parallel, scores for engagement, and exports client-ready outputs.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3">
            <Link href="/signup" className="btn-primary px-7 py-3.5 text-sm w-full sm:w-auto justify-center">
              <Icon name="bolt" className="mr-1 align-middle" /> Start your 7-day free trial
            </Link>
            <Link href="/pricing" className="btn-outline px-7 py-3.5 text-sm w-full sm:w-auto justify-center">
              See pricing
            </Link>
          </div>
          <p className="mt-3 text-sm text-stone">
            Free signup includes 50 credits · 1 credit per generation
          </p>
        </section>

        <section className="mb-14">
          <AppImage
            src={MARKETING_IMAGES.featuresWorkspace}
            alt="Creative marketing team collaborating around a workspace table"
            width={1400}
            height={840}
            sizes="(max-width: 1024px) 100vw, 1080px"
          />
        </section>

        <section className="mb-16 grid sm:grid-cols-3 gap-3">
          {[
            ['16', 'Content types'],
            ['3', 'Core AI engines'],
            ['2', 'Export formats (PDF + PPT)'],
          ].map(([value, label]) => (
            <div key={label} className="glass-card-light glass-highlight p-5 text-center">
              <p className="text-stat font-heading text-bangladesh-green">{value}</p>
              <p className="text-sm text-rich-black mt-1">{label}</p>
            </div>
          ))}
        </section>

        <section className="mb-20 space-y-12">
          {[
            {
              title: 'Campaign Builder turns ideas into launch plans',
              desc: 'Move from objective to channel plan, deliverables, and timeline without opening six separate tools.',
              img: MARKETING_IMAGES.teamPlanning,
              alt: 'Marketing strategists building campaign plans on laptops',
            },
          ].map((item, idx) => (
            <div key={item.title} className={`grid md:grid-cols-2 gap-7 items-center ${idx % 2 ? 'md:[&>*:first-child]:order-2' : ''}`}>
              <div className="order-2 md:order-1">
                <p className="eyebrow mb-3">Engine Spotlight</p>
                <h2 className="text-[1.8rem] md:text-h2 font-heading text-rich-black mb-3">{item.title}</h2>
                <p className="text-stone text-body leading-relaxed">{item.desc}</p>
              </div>
              <div className="order-1 md:order-2">
                <AppImage
                  src={item.img}
                  alt={item.alt}
                  width={1200}
                  height={860}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          ))}
        </section>

        <section className="mb-20">
          <div className="mb-8">
            <h2 className="text-h2 font-heading text-rich-black">All 16 content types</h2>
            <p className="mt-2 text-stone text-body">Every generation costs 1 credit and follows your Brand Kit automatically.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CONTENT_TYPES.map((t) => (
              <div key={t.label} className="glass-card-light glass-highlight p-5 hover:border-caribbean-green/45 transition-all duration-150">
                <Icon name={t.msym} className="text-2xl text-bangladesh-green" />
                <h3 className="mt-3 font-medium text-rich-black">{t.label}</h3>
                <p className="mt-1 text-sm text-stone">{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-20 section-dark rounded-[24px] border border-mountain-meadow/15 p-7 md:p-9">
          <h2 className="mb-8 text-h2 font-heading text-anti-flash-white">Beyond content: three growth engines</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {ENGINES.map((e) => (
              <div key={e.title} className="glass-card p-6">
                <Icon name={e.msym} className="text-3xl text-caribbean-green" />
                <h3 className="mt-3 text-lg font-medium text-anti-flash-white">{e.title}</h3>
                <p className="mt-2 text-pistachio">{e.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-20 glass-card-light glass-highlight p-8 text-center">
          <Icon name="download" className="text-3xl text-bangladesh-green mx-auto" />
          <h2 className="mt-3 text-h2 font-heading text-rich-black">Client-ready in seconds</h2>
          <p className="mx-auto mt-2 max-w-xl text-stone">
            Export any pack as branded PDF reports or PowerPoint decks.
            Studio and Agency plans add white-label exports and client portals.
          </p>
        </section>

        <section className="text-center">
          <h2 className="text-3xl font-heading text-rich-black">One brief in. A month of marketing out.</h2>
          <div className="mt-6">
            <Link href="/signup" className="btn-primary px-7 py-3.5 text-sm">
              Start free - no card required
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
