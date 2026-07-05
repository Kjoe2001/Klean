import { Icon } from '@/components/Icon';

export function SocialProof() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-12 rounded-2xl border border-slate-200 bg-white/70 p-6 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.04] md:p-8">
        <p className="text-sm uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Built by marketers, not just engineers
        </p>
        <p className="mx-auto mt-3 max-w-3xl text-lg">
          Zelvoo is built in Accra by a team with 15+ years running marketing for
          Africa's biggest retail, automotive and FMCG brands — the same playbooks
          behind campaigns for household names across Ghana, now running on AI.
        </p>
      </div>

      <div className="mb-12">
        <h2 className="mb-2 text-center text-2xl font-semibold">See what one brief produces</h2>
        <p className="mb-8 text-center text-slate-500 dark:text-slate-400">
          Real, unedited Zelvoo outputs. One Brand Kit, one brief, one click.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {['Hook set', 'Carousel + AI images', 'Client-ready PDF'].map((label) => (
            <div key={label} className="flex aspect-[4/5] items-center justify-center rounded-xl border border-slate-200 bg-slate-100/70 text-slate-500 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-400">
              {label} screenshot
            </div>
          ))}
        </div>
      </div>

      <div className="hidden md:grid md:grid-cols-3 md:gap-4">
        {[1, 2, 3].map((item) => (
          <figure key={item} className="rounded-xl border border-slate-200 bg-white/70 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <Icon name="format_quote" className="text-2xl text-primary" />
            <blockquote className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Testimonials are placeholders while we gather real quotes from early users.
            </blockquote>
            <figcaption className="mt-4 text-sm">
              <span className="font-semibold">[Client name]</span>
              <span className="text-slate-500 dark:text-slate-400"> — [Role, Company]</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
