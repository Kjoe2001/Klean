'use client';
import AppShell from '@/components/AppShell';
import Link from 'next/link';
import { Icon } from '@/components/Icon';

export default function ImageStudio() {
  return (
    <AppShell title="Image Studio" subtitle="Image generation is no longer available.">
      <div className="glass-card-light glass-highlight p-6 mb-5">
        <div className="flex items-start gap-3">
          <span className="w-10 h-10 rounded-xl bg-bangladesh-green/10 text-bangladesh-green grid place-items-center">
            <Icon name="info" className="text-xl" />
          </span>
          <div>
            <h2 className="font-heading font-semibold text-rich-black">Image generation removed</h2>
            <p className="text-sm text-stone mt-1">
              This workspace no longer supports AI image generation. Use Content Studio and Campaign Builder for text and strategy workflows.
            </p>
            <Link href="/content-studio" className="inline-flex mt-4 rounded-full bg-caribbean-green text-rich-black font-heading font-medium px-5 py-2.5 text-sm hover:brightness-110 transition">
              Open Content Studio
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
