'use client';
import AppShell from '@/components/AppShell';
import PageHead from '@/components/PageHead';

const TIERS = [
  { name: 'Registered', perks: ['20% reseller margin', 'Partner badge', 'Lead registration'], color: 'sky' },
  { name: 'Certified', perks: ['30% margin', 'Co-marketing', 'Priority support', 'Deal desk'], color: 'primary', featured: true },
  { name: 'Elite', perks: ['40% margin', 'Dedicated manager', 'Roadmap input', 'Event slots'], color: 'secondary' },
];
export default function Partners() {
  return (
    <AppShell>
      <PageHead kicker="PARTNER PORTAL" title="Grow your agency on Zelvoo"
        sub="Resell, refer and co-sell. Manage deals, access enablement and track commissions in one place." />
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {TIERS.map(t => (
          <div key={t.name} className={`glass p-5 ${t.featured ? 'ring-2 ring-primary' : ''}`}>
            <div className={`font-mono text-[10px] font-bold tracking-widest text-${t.color}`}>{t.name.toUpperCase()}</div>
            <ul className="mt-3 space-y-1.5">{t.perks.map(p => <li key={p} className="text-[13px] flex gap-2"><span className="text-emerald">✓</span>{p}</li>)}</ul>
            <button className={`mt-4 w-full rounded-full py-2.5 text-[13px] font-bold ${t.featured ? 'cta' : 'pill !w-full'}`}>{t.featured ? 'Apply now' : 'Learn more'}</button>
          </div>
        ))}
      </div>
      <div className="glass p-5">
        <div className="font-sora font-bold mb-3">Registered deals</div>
        {[['Accra Retail Co.', 'Studio × 5 seats', 'GHS 9,900/yr', 'Won'], ['Kumasi Media', 'Agency white-label', 'GHS 24,000/yr', 'In review'], ['Lagos Foods Ltd', 'Pro × 12', 'GHS 18,400/yr', 'Negotiation']].map((r, i) => (
          <div key={i} className="grid grid-cols-4 gap-2 py-2.5 border-b border-slate-100 dark:border-white/10 text-[13px]">
            <span className="font-semibold">{r[0]}</span><span className="text-slate-500">{r[1]}</span><span className="font-bold">{r[2]}</span>
            <span className={r[3] === 'Won' ? 'text-emerald font-semibold' : 'text-secondary'}>{r[3]}</span>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
