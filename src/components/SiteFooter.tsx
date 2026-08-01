import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="section-dark border-t border-mountain-meadow/15 py-10">
      <div className="max-w-6xl mx-auto px-5 flex flex-wrap items-center justify-between gap-4">
        <p className="text-stone text-sm">© 2026 Zelvoo</p>
        <div className="flex flex-wrap gap-5 text-sm text-pistachio">
          {[
            ['Privacy', '/privacy'],
            ['Terms', '/terms'],
            ['Refunds', '/refund-policy'],
            ['Downloads', '/downloads'],
            ['Cookies', '/cookies'],
            ['Contact', '/contact'],
          ].map(([label, href]) => (
            <Link key={href} href={href} className="inline-flex items-center min-h-11 px-1 hover:text-anti-flash-white transition-colors">
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}