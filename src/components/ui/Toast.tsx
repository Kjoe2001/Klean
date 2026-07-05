'use client';
import { useEffect, useState, type ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem { id: string; type: ToastType; message: string; }

let _add: (t: Omit<ToastItem, 'id'>) => void = () => {};

export function toast(type: ToastType, message: string) {
  _add({ type, message });
}
export const Toast = { success: (m: string) => toast('success', m), error: (m: string) => toast('error', m), warning: (m: string) => toast('warning', m), info: (m: string) => toast('info', m) };

const icons: Record<ToastType, string> = {
  success: 'check_circle', error: 'cancel', warning: 'warning', info: 'info',
};
const colors: Record<ToastType, string> = {
  success: 'text-teal', error: 'text-danger', warning: 'text-warning', info: 'text-primary',
};

export default function ToastContainer() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    _add = (t) => {
      const id = Math.random().toString(36).slice(2);
      setItems(p => [...p, { ...t, id }]);
      setTimeout(() => setItems(p => p.filter(x => x.id !== id)), 4000);
    };
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 items-end">
      {items.map(item => (
        <div key={item.id} className="animate-rise flex items-center gap-3 bg-white border border-[#E5E7EB] rounded-[14px] px-4 py-3 shadow-float min-w-[260px] max-w-xs">
          <span className={`material-symbols-rounded msym ${colors[item.type]}`}>{icons[item.type]}</span>
          <p className="text-sm text-[#1D1D1D] flex-1">{item.message}</p>
        </div>
      ))}
    </div>
  );
}
