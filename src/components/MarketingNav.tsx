import Link from 'next/link';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
export default function MarketingNav() {
  return (
    <nav className="sticky top-0 z-30 backdrop-blur-xl bg-white/70 dark:bg-ink/70 border-b border-slate-100 dark:border-white/10">
      <div className="max-w-6xl mx-auto flex items-center gap-6 px-5 py-3.5">
        <Logo />
        <div className="ml-auto flex items-center gap-5 text-[13.5px] font-medium text-slate-500">
          <Link href="/features" className="hidden sm:block hover:text-ink dark:hover:text-white">Features</Link>
          <Link href="/pricing" className="hidden sm:block hover:text-ink dark:hover:text-white">Pricing</Link>
          <Link href="/about" className="hidden sm:block hover:text-ink dark:hover:text-white">About</Link>
          <Link href="/login">Log in</Link>
          <ThemeToggle />
          <Link href="/signup" className="cta text-[13px] px-5 py-2.5">Start free trial</Link>
        </div>
      </div>
    </nav>
  );
}
