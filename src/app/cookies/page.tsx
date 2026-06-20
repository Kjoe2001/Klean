import MarketingNav from '@/components/MarketingNav';
export default function Page() {
  return (<><MarketingNav />
    <main className="max-w-3xl mx-auto px-5 py-14 animate-rise">
      <h1 className="font-sora font-extrabold text-3xl mb-6">Cookie Policy</h1>
      <div className="glass p-7 text-[14px] leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">{`Zelvoo uses strictly necessary cookies for authentication sessions (Supabase) and a theme preference stored in localStorage. We do not use third-party advertising cookies. Payment pages hosted by Flutterwave apply their own cookie policy.`}</div>
    </main></>);
}
