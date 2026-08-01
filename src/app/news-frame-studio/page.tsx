'use client';
import Link from 'next/link';
import { Icon } from '@/components/Icon';

export default function NewsFrameStudioPage() {
  return (
    <div className="fixed inset-0 bg-rich-black">
      <div className="md:hidden fixed top-0 left-0 right-0 z-[10000] bg-rich-black/90 backdrop-blur border-b border-mountain-meadow/25 px-3 pt-[max(env(safe-area-inset-top),0.5rem)] pb-2">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-full bg-bangladesh-green/25 text-anti-flash-white text-xs font-medium px-3 py-2 hover:brightness-110 transition shrink-0"
          >
            <Icon name="arrow_back" className="text-sm" /> Back
          </Link>
          <p className="text-xs font-heading text-pistachio truncate">News Frame Studio</p>
        </div>
      </div>

      <Link
        href="/dashboard"
        className="hidden md:inline-flex fixed top-3 left-3 z-[10000] items-center gap-1.5 rounded-full bg-rich-black text-anti-flash-white text-xs font-medium px-3.5 py-2 shadow-lg hover:brightness-110 transition"
      >
        <Icon name="arrow_back" className="text-sm" /> Zelvoo
      </Link>
      <iframe
        src="/news-frame-studio.html"
        title="Zelvoo News Frame Studio"
        className="w-full h-full border-0 pt-[3.75rem] md:pt-0"
      />
    </div>
  );
}