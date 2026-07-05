import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  ink?: boolean;    // dark navy variant
  padding?: string;
}

export default function Card({ children, className = '', ink, padding = 'p-6' }: CardProps) {
  return (
    <div className={`${ink ? 'card-ink' : 'card'} ${padding} ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div>
        <h3 className="text-base font-semibold text-[#0A0E27]">{title}</h3>
        {subtitle && <p className="text-sm text-[#6B7280] mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
