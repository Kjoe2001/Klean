"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';

export default function MarketingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-30 glass-elevated-light border-b border-bangladesh-green/12">
      <div className="max-w-6xl mx-auto flex items-center gap-3 px-4 sm:px-5 min-h-16 py-2.5">
        <div className="min-w-0 flex-shrink-0">
          <Logo darkText />
        </div>
        <div className="hidden md:flex items-center gap-6 ml-4">
          {[['Features','/features'],['Pricing','/pricing'],['About','/about']].map(([l,h]) => (
            <Link key={h} href={h} className="text-sm font-medium text-stone hover:text-rich-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caribbean-green rounded">{l}</Link>
          ))}
        </div>
        <div className="ml-auto hidden md:flex items-center gap-2.5 w-full md:w-auto justify-end">
          <Link href="/login" className="inline-flex items-center text-sm font-medium text-bangladesh-green hover:text-rich-black transition-colors px-3 py-2 min-h-11 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caribbean-green">
            Log in
          </Link>
          <Link href="/signup" className="btn-primary text-sm px-4 sm:px-5 py-2.5">
            Start free trial
          </Link>
        </div>

        <button
          type="button"
          className="ml-auto md:hidden w-11 h-11 rounded-xl border border-bangladesh-green/20 bg-white grid place-items-center flex-shrink-0"
          onClick={() => setMobileOpen(v => !v)}
          aria-expanded={mobileOpen}
          aria-label="Open menu"
        >
          <span className="sr-only">Menu</span>
          <span className="flex flex-col gap-[4px]">
            <span className={`block w-5 h-[2px] bg-bangladesh-green rounded transition-transform ${mobileOpen ? 'translate-y-[6px] rotate-45' : ''}`} />
            <span className={`block w-5 h-[2px] bg-bangladesh-green rounded transition-opacity ${mobileOpen ? 'opacity-0' : 'opacity-100'}`} />
            <span className={`block w-5 h-[2px] bg-bangladesh-green rounded transition-transform ${mobileOpen ? '-translate-y-[6px] -rotate-45' : ''}`} />
          </span>
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-bangladesh-green/12 bg-white/95 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-5 py-3 space-y-2">
            {[['Features','/features'],['Pricing','/pricing'],['About','/about'],['Contact','/contact']].map(([l,h]) => (
              <Link key={h} href={h} className="block rounded-lg px-3 py-2 text-sm font-medium text-bangladesh-green hover:bg-bangladesh-green/10">
                {l}
              </Link>
            ))}
            <div className="pt-2 grid grid-cols-1 gap-2">
              <Link href="/signup" className="btn-primary justify-center w-full py-3 text-sm">
                Start free trial
              </Link>
              <Link href="/login" className="btn-outline justify-center w-full py-3 text-sm">
                Log in
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
