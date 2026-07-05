/* CreditBalancePill — teal when healthy, amber when low, red when near zero */
interface CreditBalancePillProps {
  credits: number;
  threshold?: number;   // amber threshold, default 20
  dangerThreshold?: number; // red threshold, default 5
  onTopUp?: () => void;
}

export default function CreditBalancePill({ credits, threshold = 20, dangerThreshold = 5, onTopUp }: CreditBalancePillProps) {
  const variant = credits <= dangerThreshold ? 'danger' : credits <= threshold ? 'warning' : 'teal';

  const styles = {
    teal:    'bg-teal/10 text-teal border-teal/20',
    warning: 'bg-warning/10 text-amber-700 border-warning/20',
    danger:  'bg-danger/10 text-danger border-danger/20',
  };

  const icons = { teal: 'bolt', warning: 'warning', danger: 'error' };

  return (
    <div className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full border text-sm font-semibold ${styles[variant]}`}>
      <span className="material-symbols-rounded msym-sm">{icons[variant]}</span>
      <span>{credits} credits</span>
      {onTopUp && (
        <button
          onClick={onTopUp}
          className="ml-1 text-xs font-bold underline underline-offset-2 hover:opacity-70 transition"
          aria-label="Top up credits"
        >
          Top up
        </button>
      )}
    </div>
  );
}
