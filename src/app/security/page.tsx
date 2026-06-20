'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import PageHead from '@/components/PageHead';
import { supabase } from '@/lib/supabase';

/* Two-factor authentication via Supabase MFA (TOTP — authenticator app).
   Free, no SMS. User scans a QR in Google Authenticator / Authy and verifies. */
export default function Security() {
  const [factors, setFactors] = useState<any[]>([]);
  const [enrolling, setEnrolling] = useState(false);
  const [qr, setQr] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [factorId, setFactorId] = useState<string>('');
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');

  const refresh = async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    setFactors(data?.totp || []);
  };
  useEffect(() => { refresh(); }, []);

  const startEnroll = async () => {
    setMsg(''); setEnrolling(true);
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'Authenticator' });
    if (error) { setMsg(error.message); setEnrolling(false); return; }
    setQr(data.totp.qr_code); setSecret(data.totp.secret); setFactorId(data.id);
  };

  const verify = async () => {
    setMsg('');
    const { data: ch, error: e1 } = await supabase.auth.mfa.challenge({ factorId });
    if (e1) { setMsg(e1.message); return; }
    const { error: e2 } = await supabase.auth.mfa.verify({ factorId, challengeId: ch.id, code });
    if (e2) { setMsg('Incorrect code — try again.'); return; }
    setMsg('✓ Two-factor authentication enabled.');
    setEnrolling(false); setQr(''); setCode(''); refresh();
  };

  const remove = async (id: string) => {
    await supabase.auth.mfa.unenroll({ factorId: id });
    refresh();
  };

  const active = factors.filter(f => f.status === 'verified');

  return (
    <AppShell>
      <PageHead kicker="SECURITY" title="Two-factor authentication"
        sub="Add a second layer of protection. Use any authenticator app — Google Authenticator, Authy, 1Password — no phone number or SMS needed." />
      <div className="max-w-xl">
        {active.length > 0 ? (
          <div className="glass p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-10 h-10 rounded-xl bg-emerald/15 grid place-items-center text-xl">🔒</span>
              <div><div className="font-sora font-bold">2FA is on</div><div className="text-[12px] text-slate-500">Your account is protected by an authenticator app.</div></div>
            </div>
            {active.map(f => (
              <div key={f.id} className="flex items-center justify-between border-t border-slate-100 dark:border-white/10 pt-3 mt-3">
                <span className="text-[13px]">{f.friendly_name || 'Authenticator'} · added {new Date(f.created_at).toLocaleDateString()}</span>
                <button onClick={() => remove(f.id)} className="text-[12px] text-secondary font-semibold">Remove</button>
              </div>
            ))}
          </div>
        ) : !enrolling ? (
          <div className="glass p-6">
            <div className="text-[14px] text-slate-600 dark:text-slate-300 mb-4">Two-factor adds a one-time code from your phone on top of your password — so a stolen password alone can't get in.</div>
            <button onClick={startEnroll} className="cta px-6 py-3">Enable 2FA</button>
          </div>
        ) : (
          <div className="glass p-6">
            <div className="font-sora font-bold mb-1">1. Scan this with your authenticator app</div>
            {qr && <img src={qr} alt="2FA QR code" className="w-44 h-44 my-3 rounded-xl bg-white p-2" />}
            <div className="text-[11px] text-slate-400 mb-4">Can't scan? Enter this key manually: <span className="font-mono text-slate-600 dark:text-slate-300">{secret}</span></div>
            <div className="font-sora font-bold mb-1">2. Enter the 6-digit code</div>
            <div className="flex gap-2">
              <input value={code} onChange={e => setCode(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="000000" className="field font-mono tracking-widest" />
              <button onClick={verify} disabled={code.length !== 6} className="cta px-6">Verify</button>
            </div>
          </div>
        )}
        {msg && <div className={`mt-3 text-[13px] font-semibold ${msg.startsWith('✓') ? 'text-emerald' : 'text-secondary'}`}>{msg}</div>}
      </div>
    </AppShell>
  );
}
