import Link from 'next/link';
export default function Logo({ href = '/' }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 font-sora font-extrabold text-lg">
      <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-secondary to-primary text-white grid place-items-center text-lg">Z</span>
      Zelvoo
    </Link>
  );
}
