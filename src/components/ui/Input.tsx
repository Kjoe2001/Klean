'use client';
import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, type ReactNode } from 'react';

/* ─── Input ─────────────────────────────────────────────────────────── */
interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  error?: string;
  hint?: string;
  prefixIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, prefixIcon, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-[#0A0E27]">{label}</label>}
      <div className="relative">
        {prefixIcon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]">{prefixIcon}</span>
        )}
        <input
          ref={ref}
          className={`field ${prefixIcon ? 'pl-10' : ''} ${error ? 'border-danger focus:ring-danger/15' : ''} ${className}`}
          aria-invalid={!!error}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-danger font-medium">{error}</p>}
      {hint && !error && <p className="text-xs text-[#6B7280]">{hint}</p>}
    </div>
  ),
);
Input.displayName = 'Input';

/* ─── Textarea ───────────────────────────────────────────────────────── */
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-[#0A0E27]">{label}</label>}
      <textarea
        ref={ref}
        className={`field resize-y min-h-[90px] ${error ? 'border-danger' : ''} ${className}`}
        aria-invalid={!!error}
        {...props}
      />
      {error && <p className="text-xs text-danger font-medium">{error}</p>}
    </div>
  ),
);
Textarea.displayName = 'Textarea';

/* ─── Select ─────────────────────────────────────────────────────────── */
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, children, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-[#0A0E27]">{label}</label>}
      <select
        ref={ref}
        className={`field appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236B7280' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")] bg-no-repeat bg-[right_14px_center] pr-10 ${className}`}
        {...(props as any)}
      >
        {children}
      </select>
      {error && <p className="text-xs text-danger font-medium">{error}</p>}
    </div>
  ),
);
Select.displayName = 'Select';
