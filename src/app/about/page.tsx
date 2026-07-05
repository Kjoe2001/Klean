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
    <>
      <MarketingNav />
      <main className="mx-auto max-w-3xl px-5 py-14 animate-rise">
        <h1 className="mb-6 font-sora text-3xl font-extrabold">About Zelvoo</h1>
        <div className="glass space-y-5 p-7 text-[14px] leading-relaxed text-slate-600 dark:text-slate-300">
          <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">Marketing shouldn't be a luxury.</p>
          <p>Zelvoo is Africa&apos;s AI Marketing Operating System — built in Accra for the world. We give brands, agencies, SMEs and creators an end-to-end engine: AI content across 16 formats, AI image generation, campaign strategy, trend and competitor intelligence, and client-ready exports.</p>
          <p>Zelvoo was founded by a marketer, not a software company. After 15+ years leading marketing for some of Ghana&apos;s biggest retail, automotive and FMCG brands — and running an agency serving clients across the region — one problem kept repeating: world-class marketing takes a team most African businesses can&apos;t afford. The strategy frameworks, the content volume, the design output, the reporting — it all costs more than the businesses that need it most can pay.</p>
          <p>AI changed that equation. Zelvoo packages fifteen years of real campaign playbooks into an engine any business can run: lock a brand brief once, and everything you generate — every hook, article, ad and image — follows it automatically.</p>
          <p>Most SaaS assumes everyone has a credit card. We don&apos;t. Zelvoo accepts MTN MoMo, Telecel Cash, AirtelTigo Money, bank transfer and cards, displays prices in your local currency, and starts at $10 — because a tool built for African business should work the way African business works.</p>
          <p>Make world-class marketing capability accessible to every African business — and every business everywhere.</p>
          <Link href="/signup" className="inline-flex text-primary font-semibold">Start your free trial →</Link>
        </div>
      </main>
    </>
  );
}
