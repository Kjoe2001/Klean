import type { Metadata } from 'next';
import Link from 'next/link';
import MarketingNav from '@/components/MarketingNav';
import { Icon } from '@/components/Icon';
import { desktopDownloadProducts, desktopDownloadSource, desktopRelease } from '@/lib/desktopDownloads';

export const metadata: Metadata = {
  title: 'Desktop Downloads | Zelvoo',
  description: 'Download standalone Zelvoo desktop installers for Frame Studio, Campaign Builder, Content Studio, and Creative Studio.',
  alternates: { canonical: 'https://www.zelvoo.app/downloads' },
};

export default function DownloadsPage() {
  return (
    <div className="section-light min-h-screen">
      <div className="orb-fixed-light animate-orb" />
      <MarketingNav />

      <section className="section-white border-b border-bangladesh-green/10">
        <div className="max-w-6xl mx-auto px-5 pt-14 pb-12 md:pt-18 md:pb-14">
          <p className="eyebrow mb-4">Desktop Installers</p>
          <h1 className="font-heading text-h2 md:text-[2.5rem] mb-4 text-rich-black">
            Download Standalone Zelvoo Apps
          </h1>
          <p className="text-stone text-body max-w-3xl leading-relaxed">
            Choose your product and operating system. These links point to {desktopDownloadSource === 'supabase' ? 'Supabase Storage assets' : 'GitHub Release assets'} for tag
            <span className="font-medium text-rich-black"> {desktopRelease.tag}</span>.
          </p>
          <p className="text-xs text-stone mt-3">
            Source: {desktopDownloadSource === 'supabase' ? 'Supabase public bucket' : `GitHub repo ${desktopRelease.repo}`} · Version: {desktopRelease.version}
          </p>
        </div>
      </section>

      <section className="section-light py-12 md:py-14">
        <div className="max-w-6xl mx-auto px-5 grid md:grid-cols-2 gap-5">
          {desktopDownloadProducts.map((product) => (
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
