import MarketingNav from '@/components/MarketingNav';

export default function Page() {
  return (
    <div className="section-light min-h-screen">
      <div className="orb-fixed-light animate-orb" />
      <MarketingNav />

      <main className="max-w-6xl mx-auto px-5 py-16 md:py-20 animate-rise relative z-10">
        <section className="text-center max-w-3xl mx-auto mb-10">
          <p className="eyebrow mb-4">Contact Zelvoo</p>
          <h1 className="font-heading text-hero text-rich-black mb-4">Let's talk about your growth goals</h1>
          <p className="text-body-lg text-stone">
            Reach us for support, billing, partnerships, and enterprise onboarding.
            We usually respond within one business day.
          </p>
        </section>

        <section className="grid lg:grid-cols-[1.1fr_0.9fr] gap-5 mb-8">
          <div className="glass-card-light glass-highlight p-6 md:p-7">
            <p className="eyebrow mb-2">Email Us</p>
            <h2 className="font-heading text-h3 text-rich-black mb-4">Choose the right channel</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <a href="mailto:support@zelvoo.app?subject=Support%20Request" className="rounded-xl border border-bangladesh-green/15 bg-white p-4 hover:border-caribbean-green/45 transition-colors">
                <p className="text-sm font-medium text-rich-black">Customer Support</p>
                <p className="text-xs text-stone mt-1">support@zelvoo.app</p>
                <p className="text-xs text-stone mt-2">Account help, product guidance, and troubleshooting.</p>
              </a>
              <a href="mailto:hello@zelvoo.app?subject=Sales%20or%20Enterprise" className="rounded-xl border border-bangladesh-green/15 bg-white p-4 hover:border-caribbean-green/45 transition-colors">
                <p className="text-sm font-medium text-rich-black">Sales & Enterprise</p>
                <p className="text-xs text-stone mt-1">hello@zelvoo.app</p>
                <p className="text-xs text-stone mt-2">Enterprise plans, onboarding, and custom deployment.</p>
              </a>
              <a href="mailto:billing@zelvoo.app?subject=Billing%20Question" className="rounded-xl border border-bangladesh-green/15 bg-white p-4 hover:border-caribbean-green/45 transition-colors">
                <p className="text-sm font-medium text-rich-black">Billing</p>
                <p className="text-xs text-stone mt-1">billing@zelvoo.app</p>
                <p className="text-xs text-stone mt-2">Subscriptions, invoices, refunds, and payment issues.</p>
              </a>
              <a href="mailto:partners@zelvoo.app?subject=Partnership%20Inquiry" className="rounded-xl border border-bangladesh-green/15 bg-white p-4 hover:border-caribbean-green/45 transition-colors">
                <p className="text-sm font-medium text-rich-black">Partnerships</p>
                <p className="text-xs text-stone mt-1">partners@zelvoo.app</p>
                <p className="text-xs text-stone mt-2">Agencies, affiliates, and strategic collaborations.</p>
              </a>
            </div>
          </div>

          <div className="section-dark rounded-3xl p-6 md:p-7 border border-mountain-meadow/20">
            <p className="eyebrow text-pistachio mb-2">Office Hours</p>
            <h2 className="font-heading text-h3 text-anti-flash-white mb-3">Accra, Ghana (GMT)</h2>
            <ul className="space-y-2 text-sm text-pistachio mb-5">
              <li>Monday - Friday: 8:00 AM to 6:00 PM</li>
              <li>Saturday: 10:00 AM to 2:00 PM</li>
              <li>Sunday: Closed</li>
            </ul>
            <div className="glass-card p-4">
              <p className="text-sm text-anti-flash-white">Need urgent help?</p>
              <p className="text-xs text-pistachio mt-1">Use the subject line <b>URGENT</b> in your email and include your account email for faster routing.</p>
            </div>
          </div>
        </section>

        <section className="glass-card-light glass-highlight p-6 md:p-8 text-center">
          <p className="font-heading text-h3 text-rich-black">Ready to start instead?</p>
          <p className="text-sm text-stone mt-1 mb-4">Create your account and test the full workflow with a 7-day free trial.</p>
          <a href="/signup" className="btn-primary px-7 py-3.5">Start free trial</a>
        </section>
      </main>
    </div>
  );
}
