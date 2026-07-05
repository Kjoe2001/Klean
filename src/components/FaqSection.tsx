import { Icon } from '@/components/Icon';

const FAQS = [
  {
    q: 'How do credits work?',
    a: 'Every plan comes with a credit balance that refreshes each billing period. One content generation costs 1 credit; one AI image costs 3 credits. A full campaign pack — say 5 content types plus a carousel with images — typically uses 20–25 credits.',
  },
  {
    q: 'Can I really pay with Mobile Money?',
    a: 'Yes. Zelvoo accepts MTN MoMo, Telecel Cash and AirtelTigo Money alongside cards and bank transfer. Prices display in your local currency (GHS, NGN, KES, ZAR and more) and are billed in USD.',
  },
  {
    q: 'What do I get in the free trial?',
    a: '7 days and 30 credits — enough to generate a complete multi-format content pack and try the AI Image Studio. No credit card required to start.',
  },
  {
    q: 'What is a Brand Kit?',
    a: 'Your Brand Kit stores your brand voice, colours, audience and positioning once. Every hook, article, ad and image Zelvoo generates follows it automatically — so nothing comes out off-brand.',
  },
  {
    q: 'Can my team and clients use it?',
    a: 'Studio plans include 3 team seats and a client portal; Agency plans include 10 seats, approval workflows and white-label exports so deliverables carry your agency\'s brand.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes — cancel from your Billing page in one click. Change-of-mind refunds within 48 hours of a first paid charge are honoured, and Mobile Money refunds return to the originating wallet within 5–10 business days.',
  },
];

export function FaqSection() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h2 className="mb-10 text-center text-3xl font-bold">Questions, answered</h2>
      <div className="space-y-3">
        {FAQS.map((f) => (
          <details key={f.q} className="group rounded-xl border border-slate-200 bg-white/70 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <summary className="flex cursor-pointer items-center justify-between font-semibold list-none">
              {f.q}
              <Icon name="expand_more" className="transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-slate-500 dark:text-slate-400">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
