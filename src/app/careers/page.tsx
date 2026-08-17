'use client';

import MarketingNav from '@/components/MarketingNav';

const WHY_ZELVOO = [
  ['Real ownership', 'You will own a mission, not a to-do list. Your work moves the numbers and everyone sees it.'],
  ['Founder mentorship', 'Work directly with the founding team and learn how a startup actually finds and keeps users.'],
  ['Rewarded for results', 'Beyond a stipend: earn bonuses for active users, conversions, and partnerships you bring in.'],
];

const WILL_DO = [
  'Find and engage potential users across LinkedIn, Facebook, TikTok, X, Instagram and online communities.',
  'Reach out to agencies, SMEs, creators and marketing professionals.',
  'Encourage users to sign up and complete onboarding.',
  'Follow up with new users so they actively use the platform.',
  'Collect user feedback and feature requests.',
  'Support referral and ambassador campaigns.',
  'Build relationships with universities and marketing communities.',
  'Track sign-ups, active users and conversion rates.',
  'Help run growth experiments every week.',
];

const LOOKING_FOR = [
  'A student or recent graduate.',
  'Strong communicator, online and offline.',
  'Active on social media.',
  'Interested in startups, AI, marketing or SaaS.',
  'Self-motivated and results-driven.',
];

const BONUS_SKILLS = [
  'Canva or basic design.',
  'Copywriting.',
  'Digital marketing knowledge.',
  'Experience managing social media pages.',
  'Familiarity with LinkedIn outreach.',
];

const SUCCESS_METRICS = [
  'Qualified sign-ups generated.',
  'Users who become active.',
  'Retention after onboarding.',
  'Community partnerships created.',
  'Quality of user feedback collected.',
];

const WHAT_YOU_GET = [
  'Hands-on startup experience.',
  'Direct mentorship from the founding team.',
  'A path to a full-time role, based on performance.',
  'Certificate of completion.',
  'Performance bonuses tied to growth milestones.',
];

const PAY_STRUCTURE = [
  ['Base', 'A small monthly stipend.'],
  ['Per user', 'A bonus for every qualified active user you bring in.'],
  ['Per upgrade', 'A bigger bonus when a user converts to a paid plan.'],
  ['Partnerships', 'Extra rewards for partnerships or community events that drive sign-ups.'],
];

const APPLY_SUBJECT = 'Application%3A%20Growth%20%26%20User%20Acquisition%20Intern';
const APPLY_BODY = "Hi%20Zelvoo%20team%2C%0A%0A(Please%20attach%20your%20CV%20and%20a%20short%20note%20on%20why%20you'd%20be%20great%20at%20growth.)%0A%0AName%3A%0ALinks%20(LinkedIn%20%2F%20socials%20%2F%20portfolio)%3A%0A";
const APPLY_HREF = `mailto:Hello@zelvoo.app?subject=${APPLY_SUBJECT}&body=${APPLY_BODY}`;

function Bullet({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-sm bg-caribbean-green" />
      <span>{text}</span>
    </li>
  );
}

export default function CareersPage() {
  const copyEmail = () => {
    navigator.clipboard?.writeText('Hello@zelvoo.app');
  };

  return (
    <div className="section-light min-h-screen">
      <MarketingNav />

      <section className="section-dark border-b border-mountain-meadow/15">
        <div className="max-w-6xl mx-auto px-5 pt-14 pb-16 md:pt-20 md:pb-20">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-bangladesh-green/25 border border-mountain-meadow/25 text-xs font-medium text-caribbean-green">We are hiring · Remote / Hybrid</span>
          <h1 className="font-heading text-[2.25rem] sm:text-[3rem] md:text-[4.4rem] leading-[0.94] tracking-tight mt-6 max-w-4xl break-words" style={{ color: '#00DF81' }}>
            Help African businesses market like they&apos;ve got a whole team.
          </h1>
          <p className="text-base sm:text-body-lg md:text-[1.18rem] text-pistachio max-w-2xl leading-relaxed mt-6">
            Zelvoo is the AI marketing OS for African SMEs - one brief in, a month of on-brand content out. We are a small team building from Accra, and we are looking for someone who wants ownership and measurable outcomes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <a href="#open-role" className="btn-primary text-base px-8 py-4 justify-center">See open role</a>
            <a href="mailto:Hello@zelvoo.app?subject=CV%20-%20Zelvoo" className="btn-outline text-base px-7 py-4 justify-center border-white/25 text-white bg-white/5">Send your CV</a>
          </div>
        </div>
      </section>

      <section className="section-white py-14 md:py-16 border-b border-bangladesh-green/12">
        <div className="max-w-6xl mx-auto px-5">
          <p className="eyebrow mb-3">Why Zelvoo</p>
          <h2 className="font-heading text-h2 text-rich-black">A small team. Big-budget energy.</h2>
          <div className="grid md:grid-cols-3 gap-5 mt-8">
            {WHY_ZELVOO.map(([title, desc]) => (
              <article key={title} className="glass-card-light p-6 sm:p-7">
                <div className="h-1.5 w-12 rounded-full bg-caribbean-green/80 mb-5" />
                <h3 className="font-heading text-h3 text-rich-black">{title}</h3>
                <p className="text-stone mt-3">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="open-role" className="section-light py-14 md:py-16">
        <div className="max-w-6xl mx-auto px-5 grid lg:grid-cols-[1.7fr_0.9fr] gap-6 lg:gap-8 items-start">
          <div className="space-y-6">
            <div className="glass-elevated p-6 sm:p-8 border border-mountain-meadow/20">
              <p className="eyebrow text-pistachio mb-3">Open role</p>
              <h2 className="font-heading text-h2 text-anti-flash-white">Growth &amp; User Acquisition Intern</h2>
              <div className="flex flex-wrap gap-2 mt-5">
                {['Remote / Hybrid', 'Internship', 'Growth', 'Rolling start'].map((tag) => (
                  <span key={tag} className="rounded-full border border-caribbean-green/30 bg-caribbean-green/10 px-3 py-1 text-[11px] font-semibold tracking-[0.08em] uppercase text-caribbean-green">{tag}</span>
                ))}
              </div>
              <p className="text-pistachio mt-5 max-w-3xl">We are looking for an ambitious Growth &amp; User Acquisition Intern to help scale an AI-powered marketing platform used by marketers, content creators, social media managers, and creative professionals.</p>
              <div className="mt-6">
                <a className="btn-primary" href={APPLY_HREF}>Apply for this role</a>
              </div>
            </div>

            <div className="glass-card-light p-6 sm:p-7">
              <h3 className="font-heading text-h3 text-rich-black">What you will do</h3>
              <ul className="mt-4 space-y-2 text-stone text-[0.98rem]">
                {WILL_DO.map((t) => <Bullet key={t} text={t} />)}
              </ul>
            </div>

            <div className="glass-card-light p-6 sm:p-7">
              <h3 className="font-heading text-h3 text-rich-black">Who we are looking for</h3>
              <ul className="mt-4 space-y-2 text-stone text-[0.98rem]">
                {LOOKING_FOR.map((t) => <Bullet key={t} text={t} />)}
              </ul>
            </div>

            <div className="glass-card-light p-6 sm:p-7">
              <h3 className="font-heading text-h3 text-rich-black">Bonus skills</h3>
              <ul className="mt-4 space-y-2 text-stone text-[0.98rem]">
                {BONUS_SKILLS.map((t) => <Bullet key={t} text={t} />)}
              </ul>
            </div>

            <div className="glass-card-light p-6 sm:p-7">
              <h3 className="font-heading text-h3 text-rich-black">How success is measured</h3>
              <ul className="mt-4 space-y-2 text-stone text-[0.98rem]">
                {SUCCESS_METRICS.map((t) => <Bullet key={t} text={t} />)}
              </ul>
            </div>

            <div className="glass-card-light p-6 sm:p-7">
              <h3 className="font-heading text-h3 text-rich-black">What you get</h3>
              <ul className="mt-4 space-y-2 text-stone text-[0.98rem]">
                {WHAT_YOU_GET.map((t) => <Bullet key={t} text={t} />)}
              </ul>
            </div>

            <div className="glass-elevated p-6 sm:p-7 border border-caribbean-green/25">
              <p className="eyebrow text-pistachio mb-3">How you are paid</p>
              <h3 className="font-heading text-h3 text-anti-flash-white">Paid for results - not just for posting.</h3>
              <p className="text-pistachio mt-3">This role is built for someone who thinks like a growth marketer. The reward follows the growth.</p>
              <div className="mt-5 space-y-3 text-anti-flash-white">
                {PAY_STRUCTURE.map(([label, desc]) => (
                  <div key={label} className="grid grid-cols-[120px_1fr] gap-3">
                    <span className="font-heading text-caribbean-green text-sm">{label}</span>
                    <span className="text-pistachio">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-24">
            <div className="glass-card-light p-6 sm:p-7">
              <h3 className="font-heading text-h3 text-rich-black">Apply</h3>
              <p className="text-stone mt-3">Send your CV and a short note on why you would be great at growth.</p>
              <div className="mt-4 rounded-xl border border-bangladesh-green/20 bg-white/75 p-3 flex items-center justify-between gap-3">
                <code className="text-bangladesh-green font-semibold">Hello@zelvoo.app</code>
                <button type="button" onClick={copyEmail} className="text-xs font-medium text-bangladesh-green border border-bangladesh-green/25 rounded-md px-2.5 py-1.5 hover:bg-bangladesh-green/10">Copy</button>
              </div>
              <a href={APPLY_HREF} className="btn-primary mt-4 w-full justify-center">Apply by email</a>
              <div className="mt-6 pt-5 border-t border-bangladesh-green/15 grid gap-3 text-sm">
                {[['Type', 'Internship'], ['Location', 'Remote / Hybrid'], ['Team', 'Growth'], ['Start', 'Rolling']].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-3">
                    <span className="text-stone">{k}</span>
                    <span className="font-semibold text-rich-black">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="section-dark border-y border-mountain-meadow/15 py-14 md:py-16">
        <div className="max-w-5xl mx-auto px-5 text-center">
          <h2 className="font-heading text-h2" style={{ color: '#00DF81' }}>Do not see your role?</h2>
          <p className="text-pistachio mt-4 max-w-3xl mx-auto">We are always keen to meet sharp, self-driven people who care about African business. Send your CV and tell us what you would want to own.</p>
          <a className="btn-primary mt-7" href="mailto:Hello@zelvoo.app?subject=CV%20-%20Zelvoo">Send your CV to Hello@zelvoo.app</a>
        </div>
      </section>
    </div>
  );
}
