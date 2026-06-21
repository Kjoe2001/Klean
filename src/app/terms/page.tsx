import MarketingNav from '@/components/MarketingNav';
export default function Page() {
  return (<><MarketingNav />
    <main className="max-w-3xl mx-auto px-5 py-14 animate-rise">
      <h1 className="font-sora font-extrabold text-3xl mb-6">Terms of Service</h1>
      <div className="glass p-7 text-[14px] leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">{`Last updated: June 2026.\n\n1. Service: Zelvoo provides AI-assisted marketing content generation and related tools on a subscription basis.\n2. Accounts: you are responsible for your credentials and all activity under your account.\n3. Content ownership: you own the content you generate; you grant Zelvoo a license to process it solely to provide the service.\n4. Acceptable use: no unlawful, infringing, deceptive or harmful content; no attempts to reverse engineer the platform.\n5. AI outputs: generated content may require human review; you are responsible for compliance of published material.\n6. Billing: subscriptions renew monthly via Flutterwave until cancelled; see Refund Policy.\n7. Termination: we may suspend accounts violating these terms.\n8. Liability: service provided 'as is'; liability capped at fees paid in the prior 3 months.`}</div>
    </main></>);
}
