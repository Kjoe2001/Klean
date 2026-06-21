import MarketingNav from '@/components/MarketingNav';
export default function Page() {
  return (<><MarketingNav />
    <main className="max-w-3xl mx-auto px-5 py-14 animate-rise">
      <h1 className="font-sora font-extrabold text-3xl mb-6">About Zelvoo</h1>
      <div className="glass p-7 text-[14px] leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">{`Zelvoo is Africa's AI Marketing Operating System — built in Accra for the world. We give brands, agencies, SMEs and creators an end-to-end engine: AI content across 16 formats, AI image generation, campaign strategy, trend and competitor intelligence, scheduling, collaboration and client-ready exports.\n\nOur mission: make world-class marketing capability accessible to every African business, and every business everywhere.`}</div>
    </main></>);
}
