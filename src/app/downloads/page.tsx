import type { Metadata } from 'next';
import Link from 'next/link';
import MarketingNav from '@/components/MarketingNav';
import { Icon } from '@/components/Icon';
import { desktopDownloadProducts, desktopRelease } from '@/lib/desktopDownloads';

export const metadata: Metadata = {
  title: 'Desktop Downloads | Zelvoo',
  description: 'Download standalone Zelvoo desktop installers for Video Frame Studio, News Frame Studio, Campaign Builder, Content Studio, and Creative Studio.',
  alternates: { canonical: 'https://www.zelvoo.app/downloads' },
};

export default function DownloadsPage() {
  const allStudios = desktopDownloadProducts.find((product) => product.key === 'shared');
  const studioOnly = desktopDownloadProducts.filter((product) => product.key !== 'shared');

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
              <span className="inline-flex items-center rounded-full bg-rich-black/[0.04] text-rich-black/80 text-xs font-semibold px-3 py-1">Version {desktopRelease.version}</span>
            </div>
          </div>
        </div>
      </section>

      {allStudios && (
        <section className="section-light pt-10 pb-4">
          <div className="max-w-6xl mx-auto px-5">
            <article className="glass-card-light glass-highlight p-6 border border-caribbean-green/30">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <h2 className="font-heading text-h3 text-rich-black">{allStudios.name}</h2>
                <span className="inline-flex items-center rounded-full bg-caribbean-green text-rich-black text-[11px] font-semibold px-3 py-1">Recommended</span>
              </div>
              <p className="text-sm text-stone leading-relaxed mb-5">{allStudios.shortDescription}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Link
                  href={allStudios.downloads.macAppleSilicon}
                  className="btn-primary justify-center w-full"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="download" className="msym-sm" /> macOS Apple Silicon (arm64)
                </Link>
                <Link
                  href={allStudios.downloads.macIntel}
                  className="btn-outline justify-center w-full"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="download" className="msym-sm" /> macOS Intel (x64)
                </Link>
                <Link
                  href={allStudios.downloads.windows}
                  className="btn-outline justify-center w-full"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="download" className="msym-sm" /> Windows (x64)
                </Link>
              </div>
            </article>
          </div>
        </section>
      )}

      <section className="section-light py-12 md:py-14">
        <div className="max-w-6xl mx-auto px-5 mb-5">
          <p className="text-xs tracking-[0.2em] text-stone font-semibold">INDIVIDUAL STUDIO INSTALLERS</p>
        </div>
        <div className="max-w-6xl mx-auto px-5 grid md:grid-cols-2 gap-5">
          {studioOnly.map((product) => (
            <article key={product.key} className="glass-card-light glass-highlight p-6 border border-bangladesh-green/10">
              <h2 className="font-heading text-h3 text-rich-black mb-2">{product.name}</h2>
              <p className="text-sm text-stone leading-relaxed mb-5">{product.shortDescription}</p>

              <div className="grid grid-cols-1 gap-3">
                <Link
                  href={product.downloads.macAppleSilicon}
                  className="btn-primary justify-center w-full"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="download" className="msym-sm" /> macOS Apple Silicon (arm64)
                </Link>
                <Link
                  href={product.downloads.macIntel}
                  className="btn-outline justify-center w-full"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="download" className="msym-sm" /> macOS Intel (x64)
                </Link>
                <Link
                  href={product.downloads.windows}
                  className="btn-outline justify-center w-full"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="download" className="msym-sm" /> Windows (x64)
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
