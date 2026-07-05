/* StatCard — used on dashboard, pricing pages */
interface StatCardProps {
  value: string | number;
  label: string;
  sublabel?: string;
  trend?: number;   // positive = up, negative = down
  ink?: boolean;
}

export function StatCard({ value, label, sublabel, trend, ink }: StatCardProps) {
  return (
    <div className={ink ? 'card-ink p-6' : 'card p-6'}>
      <p className={`text-3xl font-bold font-heading ${ink ? 'text-white' : 'text-[#0A0E27]'}`}>{value}</p>
      <p className={`text-sm mt-1 ${ink ? 'text-white/60' : 'text-[#6B7280]'}`}>{label}</p>
      {sublabel && <p className={`text-xs mt-0.5 ${ink ? 'text-white/40' : 'text-[#9CA3AF]'}`}>{sublabel}</p>}
      {trend !== undefined && (
        <p className={`text-xs font-semibold mt-2 ${trend >= 0 ? 'text-teal' : 'text-danger'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </p>
      )}
    </div>
  );
}

/* PricingCard — used on /pricing */
interface PricingCardProps {
  name: string;
  price: string | number;
  currency?: string;
  period?: string;
  features: string[];
  cta: string;
  popular?: boolean;
  onSelect?: () => void;
}

export function PricingCard({ name, price, currency = '$', period = '/mo', features, cta, popular, onSelect }: PricingCardProps) {
  return (
    <div className={`relative rounded-[20px] p-7 flex flex-col gap-5 border transition-shadow hover:shadow-float
      ${popular ? 'border-primary bg-white ring-2 ring-primary' : 'border-[#E5E7EB] bg-white'}`}>
      {popular && (
        <span className="badge-popular">Most popular</span>
      )}
      <div>
        <p className="text-sm font-semibold text-[#6B7280] uppercase tracking-wider">{name}</p>
        <div className="flex items-end gap-1 mt-2">
          <span className="text-lg font-semibold text-[#6B7280]">{currency}</span>
          <span className="text-5xl font-bold text-[#0A0E27] leading-none">{price}</span>
          <span className="text-sm text-[#6B7280] mb-1">{period}</span>
        </div>
      </div>
      <ul className="flex flex-col gap-2.5 flex-1">
        {features.map(f => (
          <li key={f} className="flex items-start gap-2 text-sm text-[#1D1D1D]">
            <span className="material-symbols-rounded msym-sm text-teal mt-0.5">check</span>
            {f}
          </li>
        ))}
      </ul>
      <button
        onClick={onSelect}
        className={`w-full py-3 rounded-full font-semibold text-sm transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
          ${popular ? 'bg-ink text-white hover:bg-accent' : 'bg-[#F7F7FB] text-[#0A0E27] hover:border-primary hover:bg-primary/5 border border-[#E5E7EB]'}`}
      >
        {cta}
      </button>
    </div>
  );
}
