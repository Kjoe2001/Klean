'use client';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

type Variant = 'primary' | 'outline' | 'ghost' | 'danger';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
}

const base =
  'inline-flex items-center justify-center gap-2 font-medium font-heading select-none transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caribbean-green focus-visible:ring-offset-2 focus-visible:ring-offset-rich-black disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]';

const variants: Record<Variant, string> = {
  primary: 'bg-caribbean-green text-rich-black rounded-full shadow-[0_0_24px_rgba(0,223,129,0.25)] hover:brightness-110 hover:shadow-[0_0_34px_rgba(0,223,129,0.35)]',
  outline: 'bg-white text-bangladesh-green border border-bangladesh-green/25 rounded-[12px] backdrop-blur-md hover:border-caribbean-green/45 hover:brightness-110',
  ghost:   'bg-transparent text-bangladesh-green rounded-lg hover:bg-mountain-meadow/10',
  danger:  'bg-danger text-rich-black rounded-full hover:brightness-110',
};

const sizes: Record<Size, string> = {
  sm: 'text-sm px-4 py-2',
  md: 'text-[0.9375rem] px-6 py-3',
  lg: 'text-base px-8 py-3.5',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, children, className = '', disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading
        ? <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        : icon}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
export default Button;
