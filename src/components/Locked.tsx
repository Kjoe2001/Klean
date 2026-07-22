import Link from 'next/link';
export default function Locked({ feature, plan }: { feature: string; plan: string }) {
  return (
    <div className="glass-card-light glass-highlight p-12 text-center">
      <div className="text-4xl mb-3">🔒</div>
      <h2 className="font-sora font-bold text-lg text-rich-black">{feature} is a {plan}+ feature</h2>
      <p className="text-stone text-sm mt-1 mb-5">Upgrade to unlock this module for your account.</p>
      <Link href="/billing" className="cta px-7 py-3 text-sm">See plans →</Link>
    </div>
  );
}
