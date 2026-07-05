import Link from 'next/link';
import Logo from './Logo';
export default function MarketingNav() {
  return (
    <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB]">
      <div className="max-w-6xl mx-auto flex items-center gap-8 px-5 h-16">
        <Logo />
        <div className="hidden md:flex items-center gap-6 ml-4">
          {[['Features','/features'],['Pricing','/pricing'],['About','/about']].map(([l,h]) => (
            <Link key={h} href={h} className="text-sm font-medium text-[#6B7280] hover:text-[#0A0E27] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">{l}</Link>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Link href="/login" className="text-sm font-semibold text-[#0A0E27] hover:text-primary transition-colors px-3 py-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            Log in
          </Link>
          <Link href="/signup" className="btn-primary text-sm px-5 py-2.5">
            Start free trial
          </Link>
        </div>
      </div>
    </nav>
  );
}
