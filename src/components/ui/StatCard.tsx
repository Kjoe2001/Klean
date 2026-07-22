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
      <p className={`text-stat font-semibold font-heading ${ink ? 'text-anti-flash-white' : 'text-rich-black'}`}>{value}</p>
      <p className={`text-sm mt-1 ${ink ? 'text-pistachio' : 'text-stone'}`}>{label}</p>
      {sublabel && <p className={`text-xs mt-0.5 ${ink ? 'text-stone' : 'text-stone'}`}>{sublabel}</p>}
      {trend !== undefined && (
        <p className={`text-xs font-semibold mt-2 ${trend >= 0 ? 'text-caribbean-green' : 'text-danger'}`}>
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
    <div className={`relative rounded-[20px] p-7 flex flex-col gap-5 border transition-shadow hover:shadow-glass backdrop-blur-xl
      ${popular ? 'border-caribbean-green/60 bg-rich-black/70 ring-1 ring-caribbean-green/50' : 'border-bangladesh-green/20 bg-white/80'}`}>
      {popular && (
        <span className="badge-popular">Most popular</span>
      )}
      <div>
        <p className={`text-sm font-medium uppercase tracking-wider ${popular ? 'text-pistachio' : 'text-stone'}`}>{name}</p>
        <div className="flex items-end gap-1 mt-2">
          <span className={`text-lg font-medium ${popular ? 'text-pistachio' : 'text-stone'}`}>{currency}</span>
          <span className={`text-5xl font-semibold leading-none ${popular ? 'text-anti-flash-white' : 'text-rich-black'}`}>{price}</span>
          <span className={`text-sm mb-1 ${popular ? 'text-pistachio' : 'text-stone'}`}>{period}</span>
        </div>
      </div>
      <ul className="flex flex-col gap-2.5 flex-1">
        {features.map(f => (
          <li key={f} className={`flex items-start gap-2 text-sm ${popular ? 'text-anti-flash-white' : 'text-rich-black'}`}>
            <span className="material-symbols-rounded msym-sm text-caribbean-green mt-0.5">check</span>
            {f}
          </li>
        ))}
      </ul>
      <button
        onClick={onSelect}
        className={`w-full py-3 rounded-full font-medium text-sm transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caribbean-green focus-visible:ring-offset-2 focus-visible:ring-offset-rich-black
          ${popular ? 'bg-caribbean-green text-rich-black hover:brightness-110' : 'bg-white text-bangladesh-green hover:border-caribbean-green/40 border border-bangladesh-green/20'}`}
      >
        {cta}
      </button>
    </div>
  );
}
