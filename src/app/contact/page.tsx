import MarketingNav from '@/components/MarketingNav';
export default function Page() {
  return (<><MarketingNav />
    <main className="max-w-3xl mx-auto px-5 py-14 animate-rise">
      <h1 className="font-sora font-extrabold text-3xl mb-6">Contact</h1>
      <div className="glass p-7 text-[14px] leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">{`Sales & Enterprise: hello@zelvo.app\nSupport: support@zelvo.app\n\nAccra, Ghana · GMT\n\nFor enterprise plans, custom AI training, or partnership enquiries, email with the subject 'Enterprise'.`}</div>
    </main></>);
}
