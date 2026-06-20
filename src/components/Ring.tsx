export default function Ring({ value, color, label }: { value: number; color: string; label: string }) {
  const r = 30, c = 2 * Math.PI * r;
  return (
    <div className="text-center">
      <svg width="84" height="84" viewBox="0 0 84 84">
        <circle cx="42" cy="42" r={r} fill="none" stroke="currentColor" className="text-slate-200 dark:text-white/10" strokeWidth="8" />
        <circle cx="42" cy="42" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} transform="rotate(-90 42 42)"
          style={{ transition: 'stroke-dashoffset 1.2s' }} />
        <text x="42" y="47" textAnchor="middle" className="font-sora font-extrabold fill-current" fontSize="17">{value}</text>
      </svg>
      <div className="text-[11px] font-semibold text-slate-500 -mt-1">{label}</div>
    </div>
  );
}
