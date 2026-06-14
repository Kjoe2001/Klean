import MarketingNav from '@/components/MarketingNav';
export default function Page() {
  return (<><MarketingNav />
    <main className="max-w-3xl mx-auto px-5 py-14 animate-rise">
      <h1 className="font-sora font-extrabold text-3xl mb-6">Privacy Policy</h1>
      <div className="glass p-7 text-[14px] leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">{`Last updated: June 2026.\n\n1. Data we collect: account details (name, email, company, country), content you generate, payment metadata via Flutterwave (we never store card numbers), and usage analytics.\n2. How we use it: to provide the service, improve generation quality, process billing and provide support. We do not sell personal data.\n3. AI processing: your briefs are processed by AI providers (Anthropic) under their data processing terms; content is not used to train public models.\n4. Storage & security: data is stored with Supabase (PostgreSQL) with row-level security; passwords are hashed; transport is TLS.\n5. Your rights: export or delete your data anytime from Settings, or email support@zelvo.app.\n6. Jurisdiction: Ghana Data Protection Act, 2012 (Act 843) and applicable international frameworks.`}</div>
    </main></>);
}
