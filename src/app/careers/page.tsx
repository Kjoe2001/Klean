import type { Metadata } from 'next';
import Link from 'next/link';
import MarketingNav from '@/components/MarketingNav';

export const metadata: Metadata = {
  title: 'Careers at Zelvoo — Build Africa\'s AI Marketing OS',
  description: 'Zelvoo is building the AI Marketing Operating System for African brands and agencies. Check back for open roles or reach out directly.',
  alternates: { canonical: 'https://www.zelvoo.app/careers' },
};

export default function Page() {
  return (
    <div className="section-light min-h-screen">
      <div className="orb-fixed-light animate-orb" />
      <MarketingNav />
      <main className="mx-auto max-w-3xl px-5 py-16 md:py-20 animate-rise relative z-10 text-center">
        <p className="eyebrow mb-4">Careers</p>
        <h1 className="font-heading text-hero text-rich-black mb-5">
          We&apos;re not hiring yet, but we&apos;re growing fast.
        </h1>
        <p className="text-body-lg text-rich-black mb-8">
          Zelvoo is building Africa&apos;s AI Marketing Operating System, from Accra for the world.
          There are no open roles right now, but if you want to be first in line when that changes, reach out.
        </p>
        <Link href="/contact" className="inline-flex items-center gap-2 rounded-full bg-caribbean-green text-rich-black font-medium font-heading px-7 py-3.5 transition-all duration-150 hover:brightness-110 hover:shadow-[0_0_32px_rgba(0,223,129,0.35)]">
          Get in touch
        </Link>
      </main>
    </div>
  );
}
