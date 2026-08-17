import type { Metadata } from 'next';
import Link from 'next/link';
import MarketingNav from '@/components/MarketingNav';
import { Icon } from '@/components/Icon';

export const metadata: Metadata = {
  title: 'Desktop Downloads | Zelvoo',
  description: 'Download standalone Zelvoo desktop installers for Video Frame Studio, News Frame Studio, Campaign Builder, Content Studio, and Creative Studio.',
  alternates: { canonical: 'https://www.zelvoo.app/downloads' },
};

const ALL_STUDIOS_LINKS = {
  macAppleSilicon: 'https://drive.google.com/file/d/1a6jJ27hCKHvO095vTHEoeZ0Vr4F8YSfM/view?usp=sharing',
  macIntel: 'https://drive.google.com/file/d/1qbAVX0R8EJ7NEIBEZIkVzFPmecmIMSTo/view?usp=sharing',
  windows: 'https://drive.google.com/file/d/15hiQ9aUmj7IzDR6YCHZkwJfZx0ngBCoc/view?usp=sharing',
};

export default function DownloadsPage() {
  return (
    <div className="section-light min-h-screen relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(0,223,129,0.18),transparent_46%),radial-gradient(circle_at_82%_14%,rgba(3,113,93,0.16),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.95),rgba(250,252,251,1))]" />
      <div className="orb-fixed-light animate-orb" />
      <MarketingNav />

      <section className="relative pt-12 pb-8 md:pt-16 md:pb-10">
        <div className="max-w-6xl mx-auto px-5">
          <div className="rounded-3xl border border-caribbean-green/20 bg-white/80 backdrop-blur-xl shadow-[0_25px_80px_rgba(3,113,93,0.12)] p-7 md:p-10">
            <p className="eyebrow mb-4">Desktop Installers</p>
            <h1 className="font-heading text-[2rem] leading-tight md:text-[3rem] mb-4 text-rich-black">
              One Download Hub.<span className="block text-bangladesh-green">All Zelvoo Studios Included.</span>
            </h1>
            <p className="text-stone text-body max-w-3xl leading-relaxed">
              Install once and launch Content, Creative, Campaign, Video Frame, and News Frame studios from one desktop app.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-caribbean-green/15 text-bangladesh-green text-xs font-semibold px-3 py-1">Secure download links</span>
              <span className="inline-flex items-center rounded-full bg-rich-black/[0.04] text-rich-black/80 text-xs font-semibold px-3 py-1">Version 0.1.2</span>
            </div>
          </div>
        </div>
      </section>

      <section className="relative pb-14 md:pb-20">
        <div className="max-w-6xl mx-auto px-5">
          <article className="rounded-3xl border border-bangladesh-green/15 bg-white p-6 md:p-8 shadow-[0_16px_60px_rgba(2,46,40,0.08)]">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="font-heading text-[1.5rem] md:text-[2rem] text-rich-black">Zelvoo Desktop (All Studios)</h2>
                <p className="text-sm text-stone mt-1">Universal installer pack for every studio workflow.</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-caribbean-green text-rich-black text-[11px] font-semibold px-3 py-1">Recommended</span>
            </div>
            <p className="text-sm md:text-base text-stone leading-relaxed mb-6">One app with quick access to Content, Creative, Campaign, Video Frame, and News Frame studios.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href={ALL_STUDIOS_LINKS.macAppleSilicon}
                className="group rounded-2xl border border-caribbean-green/30 bg-gradient-to-br from-caribbean-green to-mountain-meadow text-rich-black px-5 py-4 min-h-[84px] flex flex-col items-start justify-center gap-1 shadow-[0_10px_30px_rgba(0,223,129,0.35)] transition-transform duration-300 hover:-translate-y-0.5"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="inline-flex items-center gap-2 font-semibold text-sm">
                  <Icon name="download" className="msym-sm" /> macOS Apple Silicon
                </span>
                <span className="text-xs opacity-90">ARM64 (.dmg)</span>
              </Link>
              <Link
                href={ALL_STUDIOS_LINKS.macIntel}
                className="group rounded-2xl border border-bangladesh-green/25 bg-anti-flash-white px-5 py-4 min-h-[84px] flex flex-col items-start justify-center gap-1 transition-transform duration-300 hover:-translate-y-0.5 hover:border-bangladesh-green/45"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="inline-flex items-center gap-2 font-semibold text-sm text-rich-black">
                  <Icon name="download" className="msym-sm" /> macOS Intel
                </span>
                <span className="text-xs text-stone">x64 (.dmg)</span>
              </Link>
              <Link
                href={ALL_STUDIOS_LINKS.windows}
                className="group rounded-2xl border border-bangladesh-green/25 bg-anti-flash-white px-5 py-4 min-h-[84px] flex flex-col items-start justify-center gap-1 transition-transform duration-300 hover:-translate-y-0.5 hover:border-bangladesh-green/45"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="inline-flex items-center gap-2 font-semibold text-sm text-rich-black">
                  <Icon name="download" className="msym-sm" /> Windows
                </span>
                <span className="text-xs text-stone">x64 (.exe)</span>
              </Link>
            </div>
          </article>

          <article className="mt-6 rounded-3xl border border-bangladesh-green/15 bg-white p-6 md:p-8 shadow-[0_16px_60px_rgba(2,46,40,0.08)]">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="font-heading text-[1.5rem] md:text-[2rem] text-rich-black">All Zelvoo Studios Included for Mobile</h2>
                <p className="text-sm text-stone mt-1">Use Zelvoo on Android phones.</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-caribbean-green text-rich-black text-[11px] font-semibold px-3 py-1">Mobile Ready</span>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Link
                href="/downloads/mobile/android"
                className="group rounded-2xl border border-bangladesh-green/25 bg-anti-flash-white px-5 py-4 min-h-[84px] flex flex-col items-start justify-center gap-1 transition-transform duration-300 hover:-translate-y-0.5 hover:border-bangladesh-green/45"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="inline-flex items-center gap-2 font-semibold text-sm text-rich-black">
                  <Icon name="download" className="msym-sm" /> Android Phone
                </span>
                <span className="text-xs text-stone">Download APK</span>
              </Link>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
