type BadgeVariant = 'primary' | 'teal' | 'warning' | 'danger' | 'ink' | 'muted';

const styles: Record<BadgeVariant, string> = {
  primary: 'bg-primary/10 text-primary',
  teal:    'bg-teal/10 text-teal',
  warning: 'bg-warning/10 text-amber-700',
  danger:  'bg-danger/10 text-danger',
  ink:     'bg-ink text-white',
  muted:   'bg-[#F3F4F6] text-[#6B7280]',
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = 'primary', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}
