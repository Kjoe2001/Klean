import Link from 'next/link';
export default function Logo({ href = '/', darkText = false }: { href?: string; darkText?: boolean }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2.5 min-h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caribbean-green focus-visible:ring-offset-2 focus-visible:ring-offset-anti-flash-white rounded-lg">
      <span className="w-9 h-9 rounded-xl bg-caribbean-green text-rich-black grid place-items-center text-base font-bold font-heading shadow-[0_0_18px_rgba(0,223,129,0.25)]">
        Z
      </span>
      <span className={`font-heading font-semibold text-[1.0625rem] tracking-tight ${darkText ? 'text-rich-black' : 'text-anti-flash-white'}`}>Zelvoo</span>
    </Link>
  );
}
