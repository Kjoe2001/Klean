import type { Metadata } from 'next';
import Link from 'next/link';
import MarketingNav from '@/components/MarketingNav';

export const metadata: Metadata = {
  title: 'About Zelvoo — Built in Accra for the World',
  description:
    "Zelvoo is Africa's AI Marketing Operating System. Our mission: make world-class marketing capability accessible to every African business, and every business everywhere.",
  alternates: { canonical: 'https://www.zelvoo.app/about' },
};

export default function Page() {
  return (
    <div className="section-light min-h-screen">
      <div className="orb-fixed-light animate-orb" />
      <MarketingNav />
      <main className="mx-auto max-w-6xl px-5 py-16 md:py-20 animate-rise relative z-10">
        <section className="text-center max-w-3xl mx-auto mb-12">
          <p className="eyebrow mb-4">Our Mission</p>
          <h1 className="font-heading text-hero text-rich-black mb-5">
            Marketing should never be a luxury.
          </h1>
          <p className="text-body-lg text-rich-black">
            Zelvoo is Africa&apos;s AI Marketing Operating System, built in Accra for the world.
            We help every serious business run world-class marketing without carrying world-class overhead.
          </p>
        </section>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] mb-12">
          <div className="glass-card-light glass-highlight p-7 md:p-10 space-y-5 text-rich-black">
            <div>
              <p className="eyebrow mb-3">Built for Real Operators</p>
              <h2 className="font-heading text-[clamp(2rem,4vw,3.35rem)] leading-[1.02] text-rich-black max-w-3xl">
                Built in Accra for teams that need serious marketing output without a bloated team.
              </h2>
            </div>
            <p className="text-body-lg text-rich-black max-w-2xl">
              Zelvoo exists for companies that cannot afford slow execution, fragmented tools or agency-sized retainers. We turn strategy, content, campaigns and reporting into one operating system that small teams can actually run.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 pt-2">
              {[
                ['Built in Accra', 'Designed around the pace, constraints and ambition of modern African businesses.'],
                ['Ready everywhere', 'Structured to support brands selling locally, regionally and globally from day one.'],
                ['One brand brain', 'Lock your positioning once and keep every output aligned across channels.'],
                ['Practical payments', 'Supports cards, bank transfer and leading mobile money rails used across Ghana.'],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-[18px] border border-mountain-meadow/10 bg-white/60 px-5 py-4">
                  <p className="font-heading text-lg text-rich-black">{title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-rich-black/78">{copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="section-dark rounded-[24px] border border-mountain-meadow/15 p-6 md:p-7">
              <p className="eyebrow mb-3 !text-caribbean-green">At a Glance</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
                {[
                  ['16', 'Content formats from one brief'],
                  ['1', 'Unified brand brain across every output'],
                  ['7 days', 'Free trial to test real workflows'],
                ].map(([value, label]) => (
                  <div key={label} className="glass-card p-5">
                    <p className="text-stat font-heading !text-caribbean-green">{value}</p>
                    <p className="mt-2 text-sm text-anti-flash-white/82">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card-light glass-highlight p-6 md:p-7 text-rich-black">
              <p className="eyebrow mb-3">What This Means</p>
              <div className="space-y-3 text-sm leading-relaxed">
                <p>Zelvoo helps founders, lean marketing teams and agencies move from scattered execution to repeatable output.</p>
                <p>Instead of stitching together strategy docs, post ideas, design prompts, campaign plans and reports manually, teams can run the entire workflow inside one system.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-dark rounded-[24px] border border-caribbean-green/30 p-6 md:p-8 mb-12 bg-gradient-to-br from-caribbean-green/5 to-transparent">
          <div className="grid md:grid-cols-2 gap-5">
          <div className="glass-card p-6 border-caribbean-green/40">
            <p className="eyebrow mb-3 !text-caribbean-green">What We Build</p>
            <ul className="space-y-2 text-sm text-anti-flash-white">
              <li className="flex items-start gap-2"><span className="text-caribbean-green mt-1">•</span> AI content generation across 16 formats</li>
              <li className="flex items-start gap-2"><span className="text-caribbean-green mt-1">•</span> Trend and competitor intelligence</li>
              <li className="flex items-start gap-2"><span className="text-caribbean-green mt-1">•</span> Campaign planning and client-ready exports</li>
            </ul>
          </div>
          <div className="glass-card p-6 border-caribbean-green/40">
            <p className="eyebrow mb-3 !text-caribbean-green">What We Aim For</p>
            <ul className="space-y-2 text-sm text-anti-flash-white">
              <li className="flex items-start gap-2"><span className="text-caribbean-green mt-1">•</span> Give small teams enterprise-grade marketing power</li>
              <li className="flex items-start gap-2"><span className="text-caribbean-green mt-1">•</span> Reduce execution time from weeks to minutes</li>
              <li className="flex items-start gap-2"><span className="text-caribbean-green mt-1">•</span> Keep brand consistency across every output</li>
              <li className="flex items-start gap-2"><span className="text-caribbean-green mt-1">•</span> Make global-quality growth accessible everywhere</li>
            </ul>
          </div>
          </div>
        </section>

        <section className="text-center">
          <p className="text-body text-rich-black mb-6">Make world-class marketing capability accessible to every African business, and every business everywhere.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-caribbean-green text-rich-black font-medium font-heading px-7 py-3.5 transition-all duration-150 hover:brightness-110 hover:shadow-[0_0_32px_rgba(0,223,129,0.35)]">
            Start your free trial
          </Link>
        </section>
      </main>
    </div>
  );
}
