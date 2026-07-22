type BadgeVariant = 'primary' | 'teal' | 'warning' | 'danger' | 'ink' | 'muted';

const styles: Record<BadgeVariant, string> = {
  primary: 'bg-caribbean-green/15 text-caribbean-green',
  teal:    'bg-mountain-meadow/15 text-mountain-meadow',
  warning: 'bg-warning/15 text-warning',
  danger:  'bg-danger/15 text-danger',
  ink:     'bg-dark-green text-anti-flash-white',
  muted:   'bg-basil/65 text-pistachio',
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = 'primary', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}
