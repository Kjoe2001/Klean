import Link from 'next/link';
export default function Failed() {
  return (
    <div className="min-h-screen grid place-items-center p-5">
      <div className="glass w-full max-w-md p-10 text-center animate-rise">
        <div className="text-5xl mb-3">💳</div>
        <h1 className="font-sora font-extrabold text-xl">Payment didn't go through</h1>
        <p className="text-sm text-slate-500 mt-2">No charge was made. Common fixes: insufficient MoMo balance, card 3-D Secure declined, or a network timeout. Your plan selection is saved.</p>
        <div className="flex justify-center gap-3 mt-6">
          <Link href="/billing" className="cta px-7 py-3 text-sm">Try again</Link>
          <Link href="/contact" className="pill !py-3">Contact support</Link>
        </div>
      </div>
    </div>
  );
}
