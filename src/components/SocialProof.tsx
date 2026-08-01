import Link from 'next/link';
import { Icon } from '@/components/Icon';

export function SocialProof() {
  const steps = [
    {
      id: '01',
      title: 'Claim your workspace',
      copy: 'Sign up with your work email and tell Zelvoo what you sell.',
      icon: 'rocket_launch',
    },
    {
      id: '02',
      title: 'Drop one clear brief',
      copy: 'Add audience, offer, and tone once. Zelvoo maps your campaign direction instantly.',
      icon: 'assignment',
    },
    {
      id: '03',
      title: 'Ship and scale',
      copy: 'Generate content, export polished files, and publish faster with your team.',
      icon: 'bolt',
    },
  ];

  return (
    <section className="section-white border-y border-bangladesh-green/10 py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-8">
          <p className="eyebrow mb-3">Sign Up Flow</p>
          <h2 className="font-heading text-h2 text-rich-black mb-3">Start Zelvoo in 3 simple steps</h2>
          <p className="text-stone text-body max-w-2xl mx-auto">No clutter. No setup maze. Just three moves from signup to your first campaign output.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {steps.map((step, index) => (
            <div key={step.id} className="glass-card-light glass-highlight p-6 relative overflow-hidden">
              <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-caribbean-green/12" />
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex h-8 min-w-8 px-2 items-center justify-center rounded-full bg-bangladesh-green text-anti-flash-white text-xs font-bold tracking-[0.12em]">
                  {step.id}
                </span>
                <Icon name={step.icon} className="text-caribbean-green" />
              </div>
              <h3 className="font-heading text-h3 text-rich-black mb-2">{step.title}</h3>
              <p className="text-sm text-stone leading-relaxed">{step.copy}</p>
              {index === 2 && (
                <Link href="/signup" className="inline-flex items-center gap-2 mt-5 text-sm font-medium text-bangladesh-green hover:text-caribbean-green transition-colors">
                  Open your workspace
                  <Icon name="arrow_forward" className="msym-sm" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
