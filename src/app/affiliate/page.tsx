'use client';
import AppShell from '@/components/AppShell';
import PageHead from '@/components/PageHead';

export default function Affiliate() {
  const link = 'https://zelvoo.app/?ref=eric-oa';
  return (
    <AppShell>
      <PageHead kicker="AFFILIATE PROGRAM" title="Earn 30% recurring"
        sub="Share Zelvoo, earn 30% of every payment your referrals make — for as long as they stay. Paid monthly via Mobile Money or bank." />
      <div className="grid sm:grid-cols-4 gap-4 mb-5">
        {[['Clicks', '342', 'sky'], ['Signups', '47', 'primary'], ['Paid referrals', '18', 'secondary'], ['Earned (GHS)', '4,210', 'emerald']].map(([l, v, c]) => (
          <div key={l} className="glass p-5"><div className={`font-sora font-extrabold text-3xl text-${c}`}>{v}</div><div className="text-[12px] text-slate-500 mt-1">{l}</div></div>
        ))}
      </div>
      <div className="glass p-5 mb-5">
        <div className="font-sora font-bold mb-2">Your referral link</div>
        <div className="flex gap-2">
          <input readOnly value={link} className="field font-mono !text-[12.5px]" />
          <button onClick={() => navigator.clipboard?.writeText(link)} className="cta !px-5">Copy</button>
        </div>
        <div className="flex gap-2 mt-3">{['WhatsApp', 'X', 'LinkedIn', 'Email'].map(s => <button key={s} className="pill">Share on {s}</button>)}</div>
      </div>
      <div className="glass p-5">
        <div className="font-sora font-bold mb-3">Recent payouts</div>
        {[['May 2026', 'GHS 1,480', 'MTN MoMo', 'Paid'], ['Apr 2026', 'GHS 1,210', 'MTN MoMo', 'Paid'], ['Mar 2026', 'GHS 980', 'Bank', 'Paid']].map((r, i) => (
          <div key={i} className="grid grid-cols-4 gap-2 py-2.5 border-b border-slate-100 dark:border-white/10 text-[13px]">
            <span className="text-slate-500">{r[0]}</span><span className="font-bold">{r[1]}</span><span className="text-slate-500">{r[2]}</span><span className="text-emerald font-semibold">{r[3]}</span>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
