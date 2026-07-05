import Link from 'next/link';
export default function Logo({ href = '/' }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg">
      <span className="w-9 h-9 rounded-xl bg-ink text-white grid place-items-center text-base font-bold font-heading">
        Z
      </span>
      <span className="font-heading font-bold text-[1.0625rem] text-[#0A0E27] tracking-tight">Zelvoo</span>
    </Link>
  );
}
