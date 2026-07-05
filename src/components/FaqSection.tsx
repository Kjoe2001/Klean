const FAQS = [
  { q: 'How do credits work?', a: 'Every plan comes with a credit balance that refreshes each billing period. One content generation costs 1 credit; one AI image costs 3 credits. A full campaign pack typically uses 20–25 credits.' },
  { q: 'Can I really pay with Mobile Money?', a: 'Yes. Zelvoo accepts MTN MoMo, Telecel Cash and AirtelTigo Money alongside cards and bank transfer. Prices display in your local currency and are billed in USD.' },
  { q: 'What do I get in the free trial?', a: '7 days and 30 credits — enough to generate a complete multi-format content pack and try the AI Image Studio. No credit card required.' },
  { q: 'What is a Brand Kit?', a: 'Your Brand Kit stores your brand voice, colours, audience and positioning once. Every asset Zelvoo generates follows it automatically so nothing comes out off-brand.' },
  { q: 'Can my team and clients use it?', a: 'Studio plans include 3 team seats and a client portal; Agency plans include 10 seats, approval workflows and white-label exports.' },
  { q: 'Can I cancel anytime?', a: 'Yes — cancel from your Billing page in one click. Refunds within 48 hours of a first paid charge are honoured.' },
];

export function FaqSection() {
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

  return (
    <section className="py-24 bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-3xl mx-auto px-5">
        <h2 className="text-h2 font-heading font-semibold text-[#0A0E27] text-center mb-3">Questions, answered</h2>
        <p className="text-center text-[#6B7280] mb-12">Everything you need to know before you start.</p>
        <div className="space-y-3">
          {FAQS.map(f => (
            <details key={f.q} className="group card py-5 px-6 cursor-pointer">
              <summary className="flex items-center justify-between font-semibold text-[#0A0E27] list-none text-[0.9375rem]">
                {f.q}
                <span className="material-symbols-rounded msym text-[#6B7280] transition-transform duration-200 group-open:rotate-180 shrink-0 ml-4">expand_more</span>
              </summary>
              <p className="mt-3 text-sm text-[#6B7280] leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
