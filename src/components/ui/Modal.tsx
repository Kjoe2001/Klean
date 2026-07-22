'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import Button from './Button';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-5xl' };

export default function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { open ? ref.current?.showModal() : ref.current?.close(); }, [open]);

  if (!open) return null;
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className={`${sizes[size]} w-full m-auto rounded-[20px] border border-[#E5E7EB] bg-white p-0 shadow-float backdrop:bg-[#0A0E27]/40 backdrop:backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#E5E7EB]">
        {title && <h2 className="text-lg font-semibold text-[#0A0E27]">{title}</h2>}
        <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close" className="ml-auto -mr-2">
          <span className="material-symbols-rounded msym text-[#6B7280]">close</span>
        </Button>
      </div>
      <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">{children}</div>
      {footer && <div className="px-6 pb-6 flex justify-end gap-3">{footer}</div>}
    </dialog>
  );
}
