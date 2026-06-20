import Link from 'next/link';
import MarketingNav from '@/components/MarketingNav';
import { CONTENT_TYPES } from '@/lib/content-types';

export default function Landing() {
  return (
    <>
      <MarketingNav />
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-20 w-[360px] h-[360px] rounded-full bg-secondary/15 blur-2xl" />
        <div className="absolute -bottom-36 -left-24 w-[380px] h-[380px] rounded-full bg-primary/15 blur-2xl" />
      </div>
      <header className="max-w-5xl mx-auto text-center px-5 pt-20 pb-10 animate-rise">
        <div className="font-mono text-[11px] font-bold tracking-[.2em] text-primary mb-4">AFRICA'S AI MARKETING OPERATING SYSTEM</div>
        <h1 className="font-sora font-extrabold text-4xl md:text-6xl leading-[1.06]">
          Create 30 Days of Content<br /><span className="grad-text">in Minutes.</span>
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto mt-5 text-[15.5px]">
          Your entire marketing team, running on AI. 16 content types with generated images, full campaign
          strategies, trends, competitor intel and client-ready decks — from one brief.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
          <Link href="/signup" className="cta px-9 py-4 text-base">✨ Start your 7-day free trial</Link>
          <Link href="/pricing" className="pill !px-6 !py-3.5 !text-sm">See pricing</Link>
        </div>
        <div className="text-xs text-slate-400 mt-3">No credit card · Pay with Mobile Money, card or transfer · From $19/mo</div>
      </header>
      <section className="max-w-5xl mx-auto px-5 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CONTENT_TYPES.slice(0, 8).map(t => (
            <div key={t.id} className="glass !rounded-2xl p-4 hover:-translate-y-1 transition">
              <div className="text-xl">{t.icon}</div>
              <div className="font-sora font-bold text-[13px] mt-1.5">{t.label}</div>
              <div className="text-[11.5px] text-slate-500">{t.desc}</div>
            </div>
          ))}
        </div>
        <div className="text-center text-xs text-slate-400 mt-3">+ 8 more content types · AI Image Studio · Campaign Builder · Trend Discovery · Competitor Intel</div>
      </section>
      <section className="max-w-5xl mx-auto px-5 pb-20 grid md:grid-cols-3 gap-4">
        {[
          ['🪄','One brief, everything','Lock a brand brief once. Every hook, article, ad and image follows your Brand Kit automatically.'],
          ['⚡','Parallel AI engine','Select any mix of content types — they generate simultaneously with virality and engagement scoring.'],
          ['📦','Client-ready exports','Branded PDF reports and PowerPoint decks with AI-generated visuals, built in seconds.'],
        ].map(([i,t,d]) => (
          <div key={t as string} className="glass p-6">
            <div className="text-2xl">{i}</div>
            <h3 className="font-sora font-bold mt-2">{t}</h3>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{d}</p>
          </div>
        ))}
      </section>
      <footer className="text-center text-xs text-slate-400 pb-10 space-x-4">
        <span>© 2026 Zelvoo</span>
        <Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link>
        <Link href="/refund-policy">Refunds</Link><Link href="/cookies">Cookies</Link><Link href="/contact">Contact</Link>
      </footer>
    </>
  );
}
