'use client';
import { type ReactNode } from 'react';

interface Tab { id: string; label: string; }

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
  children?: ReactNode;
}

export default function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-full bg-[#F7F7FB] border border-[#E5E7EB]">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1
            ${active === tab.id
              ? 'bg-white text-[#0A0E27] shadow-float'
              : 'text-[#6B7280] hover:text-[#0A0E27]'}`}
          role="tab"
          aria-selected={active === tab.id}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
