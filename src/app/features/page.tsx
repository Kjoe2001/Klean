import type { Metadata } from 'next';
import Link from 'next/link';
import { Icon } from '@/components/Icon';

export const metadata: Metadata = {
  title: 'Features — 16 AI Content Types, Image Studio & Campaign Builder | Zelvoo',
  description:
    'Everything Zelvoo generates from one brief: hooks, social posts, carousels with AI images, reel & video scripts, blogs, emails, ad copy, press releases, podcasts, newsletters, SEO content and more.',
  alternates: { canonical: 'https://www.zelvoo.app/features' },
};

const CONTENT_TYPES = [
  { msym: 'local_fire_department', label: 'Hooks', desc: '10 scroll-stopping openers ranked by strength — for Reels, TikTok, X and ads.' },
  { msym: 'dynamic_feed', label: 'Social Posts', desc: '7 platform-native post concepts, each shaped for the feed it lives on.' },
  { msym: 'chat_bubble', label: 'Captions', desc: '3 caption variants with researched hashtags, ready to paste.' },
  { msym: 'view_carousel', label: 'Carousels', desc: '5-slide narrative arc with AI-generated images for every slide.' },
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
    msym: 'brush',
    title: 'AI Image Studio',
    desc: 'Generate on-brand visuals for any content pack. Every image follows your Brand Kit colours and style. 3 credits per image.',
  },
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
    <main className="mx-auto max-w-6xl px-4 py-16">
      <section className="mb-16 text-center">
        <h1 className="font-sora text-4xl font-bold tracking-tight md:text-5xl">
          Everything a marketing team makes.
          <br className="hidden md:block" /> Generated from one brief.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500 dark:text-slate-400">
          Lock your Brand Kit once. Select any mix of the 16 content types below —
          they generate in parallel, scored for engagement and virality, ready to
          export as branded PDF or PowerPoint decks.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link href="/signup" className="cta px-6 py-3 text-sm">
            <Icon name="bolt" className="mr-1 align-middle" /> Start your 7-day free trial
          </Link>
          <Link href="/pricing" className="pill px-6 py-3 text-sm">
            See pricing
          </Link>
        </div>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Free trial includes 30 credits · 1 credit per generation · images 3 credits
        </p>
      </section>

      <section className="mb-20">
        <h2 className="mb-2 text-2xl font-semibold">All 16 content types</h2>
        <p className="mb-8 text-slate-500 dark:text-slate-400">
          Every generation costs 1 credit and follows your Brand Kit automatically.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CONTENT_TYPES.map((t) => (
            <div key={t.label} className="rounded-xl border border-slate-200 bg-white/70 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
              <Icon name={t.msym} className="text-2xl text-primary" />
              <h3 className="mt-3 font-semibold">{t.label}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-20">
        <h2 className="mb-8 text-2xl font-semibold">Beyond content: the four engines</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {ENGINES.map((e) => (
            <div key={e.title} className="rounded-xl border border-slate-200 bg-white/70 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
              <Icon name={e.msym} className="text-3xl text-primary" />
              <h3 className="mt-3 text-lg font-semibold">{e.title}</h3>
              <p className="mt-2 text-slate-500 dark:text-slate-400">{e.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-20 rounded-2xl border border-slate-200 bg-white/70 p-8 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <Icon name="download" className="text-3xl text-primary" />
        <h2 className="mt-3 text-2xl font-semibold">Client-ready in seconds</h2>
        <p className="mx-auto mt-2 max-w-xl text-slate-500 dark:text-slate-400">
          Export any pack as a branded PDF report or PowerPoint deck with your
          AI-generated visuals built in. Agency and Studio plans add white-label
          exports and client portals.
        </p>
      </section>

      <section className="text-center">
        <h2 className="text-3xl font-bold">One brief in. A month of marketing out.</h2>
        <div className="mt-6">
          <Link href="/signup" className="cta px-6 py-3 text-sm">
            Start free — no card required
          </Link>
        </div>
      </section>
    </main>
  );
}
